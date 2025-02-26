import { supabase } from "../supabase";

// 🔹 GAUTI AUKOJIMO ISTORIJĄ
export const getDonations = async (walletAddress) => {
  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("timestamp", { ascending: false });
  return error ? null : data;
};

// 🔹 PRIDĖTI AUKOJIMĄ
export const addDonation = async (walletAddress, amount, cause) => {
  const { data, error } = await supabase
    .from("donations")
    .insert([{ wallet_address: walletAddress, amount, cause }]);
  return error ? null : data;
};
