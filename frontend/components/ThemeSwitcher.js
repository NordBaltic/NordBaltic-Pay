import { useTheme } from "../components/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";
import "../styles/globals.css";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button 
      className={`theme-toggle ${theme}`} 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
      <span className="theme-text">
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
};

export default ThemeSwitcher;
