import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <ul className={styles.navList}>
        {/* Using NavLink to get an automatic 'active' class */}
        <li className={styles.navItem}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => (isActive ? styles.active : '')}
          >
            Dashboard
          </NavLink>
        </li>
        <li className={styles.navItem}>
          {/* Add more links as you build out your app */}
          <a href="#">Students</a>
        </li>
        <li className={styles.navItem}>
          <a href="#">Attendance Records</a>
        </li>
        <li className={styles.navItem}>
          <a href="#">Profile</a>
        </li>
      </ul>
    </aside>
  );
}

export default Sidebar;