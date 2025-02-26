import { supabase } from "../supabase";

// 🔹 GAUTI VARTOTOJO DUOMENIS
export const getUser = async (walletAddress) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();
  return error ? null : data;
};

// 🔹 IŠSAUGOTI VARTOTOJO DUOMENIS
export const saveUser = async (walletAddress, balance) => {
  const { data, error } = await supabase
    .from("users")
    .upsert({ wallet_address: walletAddress, balance }, { onConflict: "wallet_address" });
  return error ? null : data;
};
