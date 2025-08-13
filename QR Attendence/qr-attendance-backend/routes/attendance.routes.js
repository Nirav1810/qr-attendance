const express = require('express');
const router = express.Router();
const { markAttendance } = require('../controllers/attendance.controller');
const { protectStudentRoute } = require('../middleware/auth.middleware');

// This route is protected and requires a student's JWT
router.post('/mark', protectStudentRoute, markAttendance);

module.exports = router;