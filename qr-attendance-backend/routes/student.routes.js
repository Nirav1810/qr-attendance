const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/student.model');
const { registerStudent, loginStudent } = require('../controllers/student.controller');
// Face recognition imports
const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
// Monkey patch for face-api.js to work with node-canvas
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Path to face-api models
const modelsPath = path.join(__dirname, '../face-models');

// Load models once at startup
let modelsLoaded = false;
async function ensureModelsLoaded() {
  if (modelsLoaded) return;
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
  modelsLoaded = true;
}

// Configure multer for face image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/faces');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body.studentId}-${Date.now()}.jpg`);
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

// Existing routes
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// New route for face registration
router.post('/register-face', upload.single('faceImage'), async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }
    
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required' });
    }
    
  // Validate the image and compute descriptor
  const faceData = await extractFaceDescriptor(req.file.path);
  if (!faceData) {
      // Clean up the invalid image
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'No detectable face found in the image' });
    }
    
    // Find the student by studentId
    const student = await Student.findOne({ studentId });
    
    if (!student) {
      // Clean up the image
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
  // Update student with face image path and descriptor
  student.faceImagePath = req.file.path;
  student.faceDescriptor = Array.from(faceData.descriptor);
  student.faceRegistered = true;
    await student.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Face registered successfully',
      imagePath: req.file.path 
    });
  } catch (error) {
    console.error('Face registration error:', error);
    
    // Clean up the image in case of error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ success: false, message: 'Failed to register face' });
  }
});

// Extract a single face descriptor or return null if no face
async function extractFaceDescriptor(imagePath) {
  try {
    await ensureModelsLoaded();
    const stats = fs.statSync(imagePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    if (fileSizeInMB > 5) return null;

    const img = await canvas.loadImage(imagePath);
    const face = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!face) return null;
    return { descriptor: face.descriptor };
  } catch (e) {
    console.error('extractFaceDescriptor error:', e);
    return null;
  }
}

module.exports = router;