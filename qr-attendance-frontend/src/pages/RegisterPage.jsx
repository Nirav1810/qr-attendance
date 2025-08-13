import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import styles from './RegisterPage.module.css'; // Import CSS Module

const API_URL = "http://localhost:5000/api/auth/register";

function RegisterPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const registerPromise = axios.post(API_URL, formData);

    toast.promise(registerPromise, {
      loading: 'Creating account...',
      success: () => {
        navigate('/login');
        return 'Registration successful! Please log in.';
      },
      error: (error) => {
        return error.response?.data?.message || 'Registration failed.';
      },
    });
  };

  return (
    <div className={styles.pageWrapper}>
      <motion.div
        className={styles.formWrapper}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className={styles.title}>Create an Account</h1>
        <p className={styles.subtitle}>Join our platform to manage attendance.</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="password"
            name="password"
            placeholder="Password (min. 6 characters)"
            onChange={handleChange}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Register
          </button>
        </form>

        <p className={styles.linkWrapper}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default RegisterPage;