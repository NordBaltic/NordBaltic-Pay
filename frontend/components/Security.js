import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Web3 from "web3";
import Loader from "./Loader";
import { toast } from "react-toastify";

// ENV kintamieji
const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;
const SECURITY_API = process.env.NEXT_PUBLIC_SECURITY_API;
const INFURA_RPC = process.env.NEXT_PUBLIC_INFURA_RPC;

export default function Security() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    } else {
      const provider = new Web3.providers.HttpProvider(INFURA_RPC);
      setWeb3(new Web3(provider));
    }
  };

  // ✅ Pasiimti vartotojus iš backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${SECURITY_API}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Klaida gaunant vartotojus:", error);
      toast.error("⚠️ Nepavyko užkrauti vartotojų!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Ban/unban naudotoją
  const handleBanUnban = async (userId, isBanned) => {
    try {
      setLoading(true);
      await axios.post(`${SECURITY_API}/ban`, { userId, isBanned: !isBanned });
      toast.success(isBanned ? "✅ Vartotojas atblokuotas!" : "🚫 Vartotojas užblokuotas!");
      fetchUsers();
    } catch (error) {
      console.error("Klaida ban/unban operacijoje:", error);
      toast.error("⚠️ Operacija nepavyko!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Freeze/unfreeze lėšų
  const handleFreezeUnfreeze = async (userId, isFrozen) => {
    try {
      setLoading(true);
      await axios.post(`${SECURITY_API}/freeze`, { userId, isFrozen: !isFrozen });
      toast.success(isFrozen ? "✅ Lėšos atšaldytos!" : "🧊 Lėšos užšaldytos!");
      fetchUsers();
    } catch (error) {
      console.error("Klaida freeze/unfreeze operacijoje:", error);
      toast.error("⚠️ Operacija nepavyko!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lėšų grąžinimas vartotojui
  const handleRefund = async (userId, amount) => {
    try {
      setLoading(true);
      await axios.post(`${SECURITY_API}/refund`, { userId, amount });
      toast.success(`💸 Grąžinta ${amount} BNB naudotojui!`);
      fetchUsers();
    } catch (error) {
      console.error("Klaida grąžinant lėšas:", error);
      toast.error("⚠️ Operacija nepavyko!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lėšų konfiskavimas į admin wallet
  const handleConfiscateFunds = async (userId, amount) => {
    try {
      setLoading(true);
      await axios.post(`${SECURITY_API}/confiscate`, { userId, amount, adminWallet: ADMIN_WALLET });
      toast.success(`🚨 Konfiskuota ${amount} BNB į admin piniginę!`);
      fetchUsers();
    } catch (error) {
      console.error("Klaida konfiskuojant lėšas:", error);
      toast.error("⚠️ Operacija nepavyko!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="security-container">
      <h1>🛡️ Security Panel</h1>
      {loading && <Loader />}
      <table className="security-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vartotojas</th>
            <th>Balansas (BNB)</th>
            <th>Statusas</th>
            <th>Veiksmai</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.walletAddress}</td>
              <td>{user.balance} BNB</td>
              <td>
                {user.isBanned ? "🚫 Užblokuotas" : "✅ Aktyvus"} |{" "}
                {user.isFrozen ? "🧊 Užšaldytos lėšos" : "💰 Laisvos lėšos"}
              </td>
              <td>
                <button className="ban-btn" onClick={() => handleBanUnban(user.id, user.isBanned)}>
                  {user.isBanned ? "✅ Atblokuoti" : "🚫 Užblokuoti"}
                </button>
                <button className="freeze-btn" onClick={() => handleFreezeUnfreeze(user.id, user.isFrozen)}>
                  {user.isFrozen ? "💰 Atšaldyti lėšas" : "🧊 Užšaldyti lėšas"}
                </button>
                <button
                  className="refund-btn"
                  onClick={() => {
                    const amount = prompt("Įveskite grąžinamą sumą (BNB):");
                    if (amount) handleRefund(user.id, amount);
                  }}
                >
                  💸 Grąžinti lėšas
                </button>
                <button
                  className="confiscate-btn"
                  onClick={() => {
                    const amount = prompt("Įveskite konfiskuojamą sumą (BNB):");
                    if (amount) handleConfiscateFunds(user.id, amount);
                  }}
                >
                  🚨 Konfiskuoti lėšas
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
