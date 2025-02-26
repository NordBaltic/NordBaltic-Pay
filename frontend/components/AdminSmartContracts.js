import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import "../styles/globals.css";

// 🔥 Supabase setup
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function AdminSmartContracts() {
  const [contractStats, setContractStats] = useState({});
  const [fees, setFees] = useState({ staking: 4, swap: 0.2, send: 3 });
  const [statusMessage, setStatusMessage] = useState("");
  const [contractPaused, setContractPaused] = useState(false);
  const [adminLog, setAdminLog] = useState([]);

  useEffect(() => {
    fetchContractStats();
    subscribeToUpdates();
    fetchAdminLogs();
  }, []);

  const fetchContractStats = async () => {
    try {
      // 📡 Traukiam info iš Supabase
      const { data: stats } = await supabase.from("smart_contract_stats").select("*").single();
      if (stats) {
        setContractStats(stats);
        setContractPaused(stats.contractPaused);
      }

      // 📡 Traukiam fees iš Supabase
      const { data: feeData } = await supabase.from("smart_contract_fees").select("*").single();
      if (feeData) {
        setFees(feeData);
      }
    } catch (error) {
      console.error("❌ Klaida gaunant smart contract duomenis:", error);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const { data: logs } = await supabase.from("admin_logs").select("*").order("timestamp", { ascending: false }).limit(10);
      if (logs) {
        setAdminLog(logs);
      }
    } catch (error) {
      console.error("❌ Klaida gaunant admin veiksmų istoriją:", error);
    }
  };

  const subscribeToUpdates = () => {
    supabase.channel("smart_contract_updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "smart_contract_stats" }, fetchContractStats)
      .subscribe();

    supabase.channel("smart_contract_fees")
      .on("postgres_changes", { event: "*", schema: "public", table: "smart_contract_fees" }, fetchContractStats)
      .subscribe();
  };

  const logAdminAction = async (action, details) => {
    await supabase.from("admin_logs").insert([{ action, details }]);
    fetchAdminLogs();
  };

  const updateContractParams = async (param, value) => {
    try {
      await supabase.from("smart_contract_fees").update({ [param]: value }).eq("id", 1);
      setStatusMessage(`✅ Updated ${param} to ${value}%`);
      logAdminAction("Update Fee", `Changed ${param} to ${value}%`);
      fetchContractStats();
    } catch (error) {
      console.error("❌ Klaida atnaujinant kontraktą:", error);
      setStatusMessage("❌ Nepavyko atnaujinti.");
    }
  };

  const executeAdminAction = async (action) => {
    try {
      const newStatus = action === "pauseContract" ? true : false;
      await supabase.from("smart_contract_stats").update({ contractPaused: newStatus }).eq("id", 1);
      setContractPaused(newStatus);
      setStatusMessage(`✅ Contract ${action === "pauseContract" ? "paused" : "resumed"}!`);
      logAdminAction("Contract Status", `Contract ${newStatus ? "Paused" : "Resumed"}`);
    } catch (error) {
      console.error("❌ Klaida vykdant veiksmą:", error);
      setStatusMessage("❌ Nepavyko vykdyti veiksmo.");
    }
  };

  return (
    <div className="admin-contracts-container glass-card">
      <h2>🔧 Smart Contracts Control</h2>

      <div className="contract-stats">
        <p>💰 Total Staked: {contractStats.totalStaked} BNB</p>
        <p>🔄 Swap Fees Collected: {contractStats.swapFeesCollected} BNB</p>
        <p>📊 Total Transactions: {contractStats.totalTransactions}</p>
        <p className={contractPaused ? "paused-status" : "active-status"}>
          🚨 Contract Status: {contractPaused ? "⏸ PAUSED" : "🟢 ACTIVE"}
        </p>
      </div>

      <div className="fee-controls">
        <h3>⚙️ Update Fees</h3>

        <label>Staking Fee (%):</label>
        <input 
          type="number" 
          value={fees.staking} 
          onChange={(e) => setFees({ ...fees, staking: e.target.value })}
        />
        <button onClick={() => updateContractParams("staking", fees.staking)}>Update</button>

        <label>Swap Fee (%):</label>
        <input 
          type="number" 
          value={fees.swap} 
          onChange={(e) => setFees({ ...fees, swap: e.target.value })}
        />
        <button onClick={() => updateContractParams("swap", fees.swap)}>Update</button>

        <label>Send Fee (%):</label>
        <input 
          type="number" 
          value={fees.send} 
          onChange={(e) => setFees({ ...fees, send: e.target.value })}
        />
        <button onClick={() => updateContractParams("send", fees.send)}>Update</button>
      </div>

      <div className="admin-actions">
        <h3>🛠️ Admin Actions</h3>
        <button 
          className={contractPaused ? "resume-btn" : "pause-btn"} 
          onClick={() => executeAdminAction(contractPaused ? "resumeContract" : "pauseContract")}
        >
          {contractPaused ? "▶️ Resume Contract" : "⏸ Pause Contract"}
        </button>
      </div>

      {/* Admin Veiksmų istorija */}
      <div className="admin-logs">
        <h3>📜 Admin Log</h3>
        <ul>
          {adminLog.map((log, index) => (
            <li key={index}>
              [{new Date(log.timestamp).toLocaleString()}] {log.action} - {log.details}
            </li>
          ))}
        </ul>
      </div>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
      }
