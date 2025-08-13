import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import styles from './QRDisplay.module.css';

const API_URL = 'http://localhost:5000/api/qr/generate';

function QRDisplay() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQrCode = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(API_URL, config);
        setQrCodeUrl(response.data.qrCodeUrl);
        setIsLoading(false);
      } catch (error) {
        toast.error('Session expired. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchQrCode();
    const intervalId = setInterval(fetchQrCode, 10000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div className={styles.qrContainer}>
      {isLoading ? (
        <p className={styles.loadingText}>Generating QR Code...</p>
      ) : (
        <motion.div
          key={qrCodeUrl} // Re-triggers animation when URL changes
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <img src={qrCodeUrl} alt="Attendance QR Code" className={styles.qrImage} />
          <p className={styles.qrText}>This code refreshes every 10 seconds.</p>
        </motion.div>
      )}
    </div>
  );
}

export default QRDisplay;