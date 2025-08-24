const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
// Load env vars
dotenv.config();

// Route files
const authRoutes = require('./routes/auth.routes');
const qrRoutes = require('./routes/qr.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const studentRoutes = require('./routes/student.routes');

// Connect to Database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

const app = express();

// Body Parser Middleware
app.use(express.json());

// Enable CORS
app.use(cors());


// Create necessary directories for file uploads
const createUploadDirectories = () => {
  const dirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/faces'),
    path.join(__dirname, 'uploads/temp'),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Initialize everything before starting the server
async function initializeApp() {
  createUploadDirectories();
  
  // Mount routers
  app.use('/api/auth', authRoutes);
  app.use('/api/qr', qrRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/students', studentRoutes);
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

initializeApp();