const crypto = require('crypto');
const qrcode = require('qrcode');
const QrToken = require('../models/qrToken.model');

exports.generateQrCode = async (req, res) => {
  try {
    const tokenString = crypto.randomBytes(32).toString('hex');

    // Update this line to include the teacher's ID
    await QrToken.create({ 
      token: tokenString,
      teacherId: req.teacher._id, // req.teacher comes from our 'protectRoute' middleware
    });

    const qrCodeUrl = await qrcode.toDataURL(tokenString);
    res.status(200).json({ qrCodeUrl });

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Server error while generating QR code' });
  }
};