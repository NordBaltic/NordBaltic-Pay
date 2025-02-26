import { useEffect, useState } from "react";
import { Switch, Tooltip, IconButton } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { createClient } from "@supabase/supabase-js";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const ThemeSwitcher = ({ user }) => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const fetchTheme = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("theme")
          .eq("id", user.id)
          .single();

        if (data?.theme) {
          setTheme(data.theme);
        } else if (!error) {
          setTheme(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        }
      } else {
        setTheme(localStorage.getItem("theme") || "dark");
      }
    };

    fetchTheme();
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (user) {
      supabase.from("users").update({ theme }).eq("id", user.id);
    }
  }, [theme, user]);

  return (
    <Tooltip title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`} arrow>
      <IconButton
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        color="inherit"
        className="theme-switcher"
      >
        {theme === "dark" ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeSwitcher;
