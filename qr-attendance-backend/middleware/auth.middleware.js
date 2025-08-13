const jwt = require('jsonwebtoken');
const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');

// Add this new middleware for protecting student routes
exports.protectStudentRoute = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.student = await Student.findById(decoded.id).select('-password');
      if (!req.student) {
        return res.status(401).json({ message: 'Not authorized, student not found' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.protectRoute = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (we stored the id in the payload)
      // and attach it to the request object
      req.teacher = await Teacher.findById(decoded.id).select('-password');
      
      if (!req.teacher) {
        return res.status(401).json({ message: 'Not authorized, teacher not found' });
      }

      next(); // Proceed to the next middleware/controller
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};