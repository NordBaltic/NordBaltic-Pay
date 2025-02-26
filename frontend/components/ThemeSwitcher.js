import { useTheme } from "../context/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa"; // Importuojame ikonėles
import "../styles/globals.css"; // Užtikriname, kad CSS bus naudojamas

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
