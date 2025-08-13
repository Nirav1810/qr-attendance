import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRDisplay from '../components/QRDisplay';
import styles from './DashboardPage.module.css';

function DashboardPage() {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  return (
    <motion.div
      className={styles.pageContainer}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Generate a QR code to begin taking attendance.</p>
      </header>

      <div className={styles.actionBox}>
        {showQR ? (
          <>
            <QRDisplay />
            <button
              onClick={() => setShowQR(false)}
              className={`${styles.button} ${styles.buttonDanger}`}
            >
              Terminate Session
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowQR(true)}
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Generate Attendance QR Code
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default DashboardPage;