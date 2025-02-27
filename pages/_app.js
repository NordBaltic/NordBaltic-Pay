import '../styles/globals.css';
import '../styles/theme.css';
import '../styles/navbar.css';
import '../styles/tables.css';
import '../styles/buttons.css';

import { useEffect, useState } from 'react';

export default function MyApp({ Component, pageProps }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme) {
      setDarkMode(savedTheme === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <div className={`app-wrapper ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <a href="#">Home</a>
        <a href="#">Dashboard</a>
        <a href="#">Settings</a>
        <button className="toggle-theme" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>
      </nav>
      <div className="page-content">
        <Component {...pageProps} />
      </div>
    </div>
  );
}
