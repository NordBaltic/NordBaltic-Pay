import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/globals.css";

export default function AdminSmartContracts() {
  const [contractStats, setContractStats] = useState({});
  const [fees, setFees] = useState({ staking: 4, swap: 0.2, send: 3 });
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchContractStats();
  }, []);

  const fetchContractStats = async () => {
    try {
      const response = await axios.get("/api/smart-contracts/stats");
      setContractStats(response.data);
    } catch (error) {
      console.error("❌ Error fetching contract stats:", error);
    }
  };

  const updateContractParams = async (param, value) => {
    try {
      await axios.post("/api/smart-contracts/update", { param, value });
      setStatusMessage(`✅ Updated ${param} to ${value}`);
      fetchContractStats();
    } catch (error) {
      console.error("❌ Error updating contract:", error);
      setStatusMessage("❌ Failed to update contract.");
    }
  };

  const executeAdminAction = async (action) => {
    try {
      await axios.post("/api/smart-contracts/execute", { action });
      setStatusMessage(`✅ Executed ${action}`);
      fetchContractStats();
    } catch (error) {
      console.error("❌ Error executing action:", error);
      setStatusMessage("❌ Failed to execute action.");
    }
  };

  return (
    <div className="admin-contracts-container">
      <h2>🔧 Smart Contracts Control</h2>
      
      <div className="contract-stats">
        <p>💰 Total Staked: {contractStats.totalStaked} BNB</p>
        <p>🔄 Swap Fees Collected: {contractStats.swapFeesCollected} BNB</p>
        <p>📊 Total Transactions: {contractStats.totalTransactions}</p>
      </div>

      <div className="fee-controls">
        <h3>⚙️ Update Fees</h3>
        <label>Staking Fee (%):</label>
        <input 
          type="number" 
          value={fees.staking} 
          onChange={(e) => setFees({ ...fees, staking: e.target.value })}
        />
        <button onClick={() => updateContractParams("stakingFee", fees.staking)}>Update</button>

        <label>Swap Fee (%):</label>
        <input 
          type="number" 
          value={fees.swap} 
          onChange={(e) => setFees({ ...fees, swap: e.target.value })}
        />
        <button onClick={() => updateContractParams("swapFee", fees.swap)}>Update</button>

        <label>Send Fee (%):</label>
        <input 
          type="number" 
          value={fees.send} 
          onChange={(e) => setFees({ ...fees, send: e.target.value })}
        />
        <button onClick={() => updateContractParams("sendFee", fees.send)}>Update</button>
      </div>

      <div className="admin-actions">
        <h3>🛠️ Admin Actions</h3>
        <button onClick={() => executeAdminAction("pauseContract")}>⏸ Pause Contract</button>
        <button onClick={() => executeAdminAction("resumeContract")}>▶️ Resume Contract</button>
      </div>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
      }
