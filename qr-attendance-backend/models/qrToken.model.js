const mongoose = require('mongoose');

const qrTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  // ADD THIS FIELD:
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '10s', 
  },
});

const QrToken = mongoose.model('QrToken', qrTokenSchema);

module.exports = QrToken;