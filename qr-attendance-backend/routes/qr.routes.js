const express = require('express');
const router = express.Router();
const { generateQrCode } = require('../controllers/qr.controller');
const { protectRoute } = require('../middleware/auth.middleware');

// This route is protected. The user must provide a valid JWT.
router.get('/generate', protectRoute, generateQrCode);

module.exports = router;