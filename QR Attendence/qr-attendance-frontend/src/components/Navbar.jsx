import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <h1 className={styles.title}>QR Attendance System</h1>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </nav>
  );
}

export default Navbar;