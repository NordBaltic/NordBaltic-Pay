import { supabase } from "../supabase";

// 🔹 GAUTI TRANSAKCIJAS
export const getTransactions = async (walletAddress) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("timestamp", { ascending: false });
  return error ? null : data;
};

// 🔹 PRIDĖTI TRANSAKCIJĄ
export const addTransaction = async (walletAddress, amount, type) => {
  const { data, error } = await supabase
    .from("transactions")
    .insert([{ wallet_address: walletAddress, amount, type }]);
  return error ? null : data;
};
