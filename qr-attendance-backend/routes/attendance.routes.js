const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { markAttendance } = require('../controllers/attendance.controller');
const { protectStudentRoute } = require('../middleware/auth.middleware');
const Student = require('../models/student.model');
const QR = require('../models/qrToken.model');
// Face recognition imports
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
// Monkey patch for face-api.js to work with node-canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load models once at startup
const MODEL_URL = path.join(__dirname, '../face-models');
let modelsReady = false;
async function ensureFaceModels() {
  if (modelsReady) return;
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
  modelsReady = true;
  console.log('Face recognition models loaded');
}
ensureFaceModels().catch(err => console.error('Error loading face recognition models:', err));

// ... rest of your attendance.routes.js code remains the same ...
// Configure multer for face image uploads during verification
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `verification-${Date.now()}.jpg`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Existing route
router.post('/mark', protectStudentRoute, markAttendance);

// New route for face verification
router.post('/verify-face', protectStudentRoute, upload.single('faceImage'), async (req, res) => {
  try {
  const { qrToken } = req.body;
  const authedStudentId = req.student?.studentId;
    
    if (!req.file) {
      return res.status(400).json({ verified: false, message: 'No image uploaded' });
    }
    
  if (!qrToken) return res.status(400).json({ verified: false, code: 'NO_TOKEN', message: 'QR token is required' });
  if (!authedStudentId) return res.status(401).json({ verified: false, code: 'NO_AUTH', message: 'Student auth required' });
    
    // Verify the QR token first
  const qrRecord = await QR.findOne({ token: qrToken, used: false });
  if (!qrRecord) return res.status(400).json({ verified: false, code: 'INVALID_OR_USED', message: 'Invalid or used QR code' });
    
    // Get the student ID from the QR record
  const studentId = authedStudentId;
    
    // Get the student's registered descriptor or fallback image path from the database
    const student = await Student.findOne({ studentId });
    if (!student || (!student.faceDescriptor && !student.faceImagePath)) {
      return res.status(400).json({ verified: false, message: 'No registered face found for this student' });
    }

    // Prefer stored descriptor for reliability
    let isMatch = false;
    if (student.faceDescriptor && Array.isArray(student.faceDescriptor)) {
      isMatch = await compareWithStoredDescriptor(req.file.path, Float32Array.from(student.faceDescriptor));
    } else {
      isMatch = await compareFacesWithFaceAPI(req.file.path, student.faceImagePath);
    }
    
    // Clean up the temporary file
    fs.unlinkSync(req.file.path);
    
  if (isMatch) {
      // Mark the QR as used
      await QR.updateOne(
        { _id: qrRecord._id },
        { $set: { used: true } }
      );
      
      return res.status(200).json({ 
        verified: true, 
        message: 'Face verified successfully' 
      });
    } else {
  return res.status(400).json({ verified: false, code: 'NO_MATCH', message: 'Face verification failed' });
    }
  } catch (error) {
    console.error('Face verification error:', error);
    
    // Clean up the temporary file in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
  res.status(500).json({ verified: false, code: 'SERVER_ERROR', message: 'Failed to verify face' });
  }
});
// Face comparison function using face-api.js
async function compareFacesWithFaceAPI(uploadedImagePath, registeredImagePath) {
  try {
  await ensureFaceModels();
    // Validate image files
    const validateImageFile = (filePath) => {
      try {
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        
        // Check file size (limit to 5MB)
        if (fileSizeInMB > 5) {
          console.error(`Image too large: ${fileSizeInMB}MB`);
          return false;
        }
        
        // Check if file exists and is readable
        if (!fs.existsSync(filePath)) {
          console.error(`Image file does not exist: ${filePath}`);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error validating image file:', error);
        return false;
      }
    };
    
    if (!validateImageFile(uploadedImagePath) || !validateImageFile(registeredImagePath)) {
      return false;
    }
    
    // Load images
    const uploadedImg = await canvas.loadImage(uploadedImagePath);
    const registeredImg = await canvas.loadImage(registeredImagePath);
    
    // Detect faces and get descriptors
    const uploadedFace = await faceapi
      .detectSingleFace(uploadedImg)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    const registeredFace = await faceapi
      .detectSingleFace(registeredImg)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    // If no face is detected in either image, return false
    if (!uploadedFace || !registeredFace) {
      console.log('No face detected in one or both images');
      return false;
    }
    
  // Calculate distance between descriptors
  const distance = faceapi.euclideanDistance(uploadedFace.descriptor, registeredFace.descriptor);
    
    console.log(`Face distance: ${distance}`);
    
    // Threshold: start at 0.6; relax slightly to 0.62 for variance
    return distance < 0.62;
  } catch (error) {
    console.error('Error comparing faces with face-api.js:', error);
    return false;
  }
}

// Compare uploaded image to stored descriptor
async function compareWithStoredDescriptor(uploadedImagePath, storedDescriptor) {
  try {
    await ensureFaceModels();
    const stats = fs.statSync(uploadedImagePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    if (fileSizeInMB > 5) return false;

    const uploadedImg = await canvas.loadImage(uploadedImagePath);
    const uploadedFace = await faceapi
      .detectSingleFace(uploadedImg)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!uploadedFace) return false;

    const distance = faceapi.euclideanDistance(uploadedFace.descriptor, storedDescriptor);
    console.log(`Face distance (descriptor): ${distance}`);
    return distance < 0.62;
  } catch (e) {
    console.error('compareWithStoredDescriptor error:', e);
    return false;
  }
}

module.exports = router;