const QrToken = require('../models/qrToken.model');
const AttendanceRecord = require('../models/attendance.model');

exports.markAttendance = async (req, res) => {
  const { qrToken, courseId } = req.body; // Student now sends courseId
  const studentId = req.student.studentId; // Get student from the protected route middleware

  if (!qrToken || !courseId) {
    return res.status(400).json({ error: 'QR Token and Course ID are required.' });
  }

  try {
    // Find the temporary token in the database
    const tokenDoc = await QrToken.findOne({ token: qrToken });

    if (!tokenDoc) {
      return res.status(400).json({ error: 'Invalid or expired QR code.' });
    }

    // Create the permanent attendance record
    await AttendanceRecord.create({
      studentId: studentId,
      courseId: courseId,
      markedBy: tokenDoc.teacherId,
    });

    // Immediately delete the token to prevent reuse
    await tokenDoc.deleteOne();

    res.status(201).json({ message: 'Attendance marked successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while marking attendance.' });
  }
};