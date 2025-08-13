import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import styles from './LoginPage.module.css'; // Import the CSS Module

const API_URL = "http://localhost:5000/api/auth/login";

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginPromise = axios.post(API_URL, formData);

    toast.promise(loginPromise, {
      loading: 'Logging in...',
      success: (response) => {
        localStorage.setItem('token', response.data.token);
        navigate('/dashboard');
        return 'Login successful!';
      },
      error: (error) => {
        return error.response?.data?.message || 'Login failed. Please try again.';
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
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Please enter your credentials to log in.</p>

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
            placeholder="Password"
            onChange={handleChange}
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>

        <p className={styles.linkWrapper}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;