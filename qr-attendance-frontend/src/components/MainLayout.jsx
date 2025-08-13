import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';

function MainLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Navbar />
      <Sidebar />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}

export default MainLayout;