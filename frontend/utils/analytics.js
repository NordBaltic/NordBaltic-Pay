import axios from "axios";

// 🔥 FETCH USER ANALYTICS
export const getUserAnalytics = async (walletAddress) => {
  try {
    const response = await axios.get(`/api/analytics/user/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user analytics:", error);
    return null;
  }
};

// 🔥 FETCH GLOBAL ANALYTICS (ADMIN)
export const getGlobalAnalytics = async () => {
  try {
    const response = await axios.get(`/api/analytics/global`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching global analytics:", error);
    return null;
  }
};

// 🔥 FETCH SWAP FEE ANALYTICS
export const getSwapFeeAnalytics = async () => {
  try {
    const response = await axios.get(`/api/analytics/swap-fees`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching swap fee analytics:", error);
    return null;
  }
};

// 🔥 FETCH TRANSACTION HISTORY
export const getTransactionHistory = async (walletAddress) => {
  try {
    const response = await axios.get(`/api/transactions/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching transaction history:", error);
    return null;
  }
};

// 🔥 FETCH STAKING ROI ANALYTICS
export const getStakingROI = async (walletAddress) => {
  try {
    const response = await axios.get(`/api/analytics/staking-roi/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching staking ROI:", error);
    return null;
  }
};
