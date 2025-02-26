export default async function handler(req, res) {
  try {
    const analyticsData = {
      totalTransactions: 125430,
      totalVolume: 1420.55,
      totalUsers: 30500,
      swapVolume: 312.45,
      donationVolume: 84.32,
      stakingVolume: 520.78,
    };
    
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("❌ Error fetching analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
