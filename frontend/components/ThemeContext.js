import { useState, useEffect, createContext, useContext } from "react";

// Sukuriame Theme Context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Sukuriame funkciją, kad būtų patogiau naudoti kontekstą
export const useTheme = () => useContext(ThemeContext);
