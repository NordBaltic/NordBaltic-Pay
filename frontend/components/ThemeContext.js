import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// 🌙 Temų konteksto sukūrimas
const ThemeContext = createContext();

export const ThemeProvider = ({ children, user }) => {
  const [theme, setTheme] = useState("dark");
  const [mounted, setMounted] = useState(false); // Apsaugo nuo "Hydration" klaidos Next.js

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
    setMounted(true); // Užtikrina, kad komponentas užsikrovė
  }, [user]);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    if (user) {
      supabase.from("users").update({ theme }).eq("id", user.id);
    }
  }, [theme, user, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 🎨 Lengvas temų valdymas
export const useTheme = () => useContext(ThemeContext);
