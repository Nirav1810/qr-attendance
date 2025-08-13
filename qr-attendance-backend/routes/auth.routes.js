const express = require('express');
const router = express.Router();
const { registerTeacher, loginTeacher } = require('../controllers/auth.controller');

router.post('/register', registerTeacher);
router.post('/login', loginTeacher);

module.exports = router;