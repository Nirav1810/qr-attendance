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
  // Track whether token was used (for verification flow)
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Extend TTL to avoid frequent 400s during student verification
    expires: '2m',
  },
});

const QrToken = mongoose.model('QrToken', qrTokenSchema);

module.exports = QrToken;