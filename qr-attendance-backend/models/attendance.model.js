const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student'
  },
  courseId: {
    type: String,
    required: true,
  },
  markedBy: { // Teacher's ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceSchema, 'attendancerecords');
module.exports = AttendanceRecord;