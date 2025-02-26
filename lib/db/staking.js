import { supabase } from "../supabase";

// 🔹 GAUTI STAKING INFO
export const getStakingInfo = async (walletAddress) => {
  const { data, error } = await supabase
    .from("staking")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();
  return error ? null : data;
};

// 🔹 ATNAUJINTI STAKING
export const updateStaking = async (walletAddress, amount) => {
  const { data, error } = await supabase
    .from("staking")
    .upsert({ wallet_address: walletAddress, amount }, { onConflict: "wallet_address" });
  return error ? null : data;
};
