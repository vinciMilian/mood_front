import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle-track">
        <div className={`theme-toggle-thumb ${isDarkMode ? 'dark' : 'light'}`}>
          <span className="theme-icon">
            {isDarkMode ? '🌙' : '☀️'}
          </span>
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
