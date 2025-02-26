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
  const { theme, setTheme } = useTheme();
  const [icon, setIcon] = useState("🌙");

  useEffect(() => {
    setIcon(theme === "dark" ? "☀️" : "🌙");
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);

    // Saugo į Supabase duomenų bazę
    if (user) {
      await supabase.from("users").update({ theme: newTheme }).eq("id", user.id);
    }
  };

  return (
    <motion.button 
      className="theme-switcher"
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon} {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </motion.button>
  );
};

export default ThemeSwitcher;
