const Student = require('../models/student.model');
const jwt = require('jsonwebtoken');

// Helper to generate JWT for students
const generateStudentToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.registerStudent = async (req, res) => {
  const { studentId, name, password } = req.body;
  if (!studentId || !name || !password) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }
  try {
    const studentExists = await Student.findOne({ studentId });
    if (studentExists) {
      return res.status(400).json({ message: 'Student with this ID already exists' });
    }
    const student = await Student.create({ studentId, name, password });
    res.status(201).json({ message: 'Student registered successfully', studentId: student.studentId });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  const { studentId, password } = req.body;
  try {
    const student = await Student.findOne({ studentId });
    if (student && (await student.comparePassword(password))) {
      res.json({
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        token: generateStudentToken(student._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid student ID or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};