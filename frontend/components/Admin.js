import { useState, useEffect } from "react";
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import axios from "axios";
import "../styles/globals.css";

export default function Admin({ adminAccount }) {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [freezeBalances, setFreezeBalances] = useState([]);
  const [userToBan, setUserToBan] = useState("");
  const [userToUnban, setUserToUnban] = useState("");
  const [userToFreeze, setUserToFreeze] = useState("");
  const [userToUnfreeze, setUserToUnfreeze] = useState("");
  const [refundAddress, setRefundAddress] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const contractAddress = process.env.NEXT_PUBLIC_ADMIN_CONTRACT;

  useEffect(() => {
    const loadContract = async () => {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      const contractABI = [
        // 🔹 Smart contract funkcijų ABI (reikia pritaikyti pagal tikrą kontraktą)
        {
          "constant": false,
          "inputs": [{ "name": "_user", "type": "address" }],
          "name": "banUser",
          "outputs": [],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{ "name": "_user", "type": "address" }],
          "name": "unbanUser",
          "outputs": [],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{ "name": "_user", "type": "address" }],
          "name": "freezeFunds",
          "outputs": [],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{ "name": "_user", "type": "address" }],
          "name": "unfreezeFunds",
          "outputs": [],
          "type": "function"
        },
        {
          "constant": false,
          "inputs": [{ "name": "_to", "type": "address" }, { "name": "_amount", "type": "uint256" }],
          "name": "refund",
          "outputs": [],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "getBannedUsers",
          "outputs": [{ "name": "", "type": "address[]" }],
          "type": "function"
        },
        {
          "constant": true,
          "inputs": [],
          "name": "getFrozenBalances",
          "outputs": [{ "name": "", "type": "address[]" }],
          "type": "function"
        }
      ];

      const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
      setContract(contractInstance);

      const bannedUsers = await contractInstance.methods.getBannedUsers().call();
      setBlockedUsers(bannedUsers);

      const frozenBalances = await contractInstance.methods.getFrozenBalances().call();
      setFreezeBalances(frozenBalances);
    };

    loadContract();
  }, []);

  const handleBanUser = async () => {
    if (!web3 || !contract) return;
    await contract.methods.banUser(userToBan).send({ from: adminAccount });
    setBlockedUsers([...blockedUsers, userToBan]);
    setUserToBan("");
  };

  const handleUnbanUser = async () => {
    if (!web3 || !contract) return;
    await contract.methods.unbanUser(userToUnban).send({ from: adminAccount });
    setBlockedUsers(blockedUsers.filter(user => user !== userToUnban));
    setUserToUnban("");
  };

  const handleFreezeFunds = async () => {
    if (!web3 || !contract) return;
    await contract.methods.freezeFunds(userToFreeze).send({ from: adminAccount });
    setFreezeBalances([...freezeBalances, userToFreeze]);
    setUserToFreeze("");
  };

  const handleUnfreezeFunds = async () => {
    if (!web3 || !contract) return;
    await contract.methods.unfreezeFunds(userToUnfreeze).send({ from: adminAccount });
    setFreezeBalances(freezeBalances.filter(user => user !== userToUnfreeze));
    setUserToUnfreeze("");
  };

  const handleRefund = async () => {
    if (!web3 || !contract) return;
    const amountInWei = web3.utils.toWei(refundAmount, "ether");
    await contract.methods.refund(refundAddress, amountInWei).send({ from: adminAccount });
    setRefundAddress("");
    setRefundAmount("");
  };

  return (
    <div className="admin-container">
      <h2>👑 Admin Panel</h2>

      <div className="admin-section">
        <h3>🚫 Ban / Unban Users</h3>
        <input type="text" placeholder="User Address" value={userToBan} onChange={(e) => setUserToBan(e.target.value)} />
        <button onClick={handleBanUser}>Ban User</button>
        <input type="text" placeholder="User Address" value={userToUnban} onChange={(e) => setUserToUnban(e.target.value)} />
        <button onClick={handleUnbanUser}>Unban User</button>
        <p>Banned Users: {blockedUsers.join(", ") || "None"}</p>
      </div>

      <div className="admin-section">
        <h3>❄️ Freeze / Unfreeze Funds</h3>
        <input type="text" placeholder="User Address" value={userToFreeze} onChange={(e) => setUserToFreeze(e.target.value)} />
        <button onClick={handleFreezeFunds}>Freeze Funds</button>
        <input type="text" placeholder="User Address" value={userToUnfreeze} onChange={(e) => setUserToUnfreeze(e.target.value)} />
        <button onClick={handleUnfreezeFunds}>Unfreeze Funds</button>
        <p>Frozen Accounts: {freezeBalances.join(", ") || "None"}</p>
      </div>

      <div className="admin-section">
        <h3>💸 Refund</h3>
        <input type="text" placeholder="Recipient Address" value={refundAddress} onChange={(e) => setRefundAddress(e.target.value)} />
        <input type="number" placeholder="Amount in BNB" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
        <button onClick={handleRefund}>Send Refund</button>
      </div>
    </div>
  );
}
