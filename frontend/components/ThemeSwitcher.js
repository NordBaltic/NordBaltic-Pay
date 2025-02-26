import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

// 🔥 Supabase Setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ThemeSwitcher = ({ user }) => {
  const { theme, toggleTheme } = useTheme();
  const [icon, setIcon] = useState("🌙");

  useEffect(() => {
    setIcon(theme === "dark" ? "☀️" : "🌙");
  }, [theme]);

  return (
    <motion.button 
      className="theme-switcher"
      onClick={toggleTheme}
      whileHover={{ scale: 1.12, rotate: 10, boxShadow: "0px 0px 12px var(--primary-color)" }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.2 }}
    >
      {icon} {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </motion.button>
  );
};

export default ThemeSwitcher;
