const Teacher = require('../models/teacher.model');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token valid for 1 day
  });
};

// @desc    Register a new teacher
// @route   POST /api/auth/register
exports.registerTeacher = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    const teacherExists = await Teacher.findOne({ email });

    if (teacherExists) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    const teacher = await Teacher.create({ email, password });

    if (teacher) {
      res.status(201).json({
        _id: teacher._id,
        email: teacher.email,
        token: generateToken(teacher._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid teacher data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Authenticate a teacher & get token
// @route   POST /api/auth/login
exports.loginTeacher = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });

    if (teacher && (await teacher.comparePassword(password))) {
      res.json({
        _id: teacher._id,
        email: teacher.email,
        token: generateToken(teacher._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};