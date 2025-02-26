import { useState, useEffect } from "react";
import Web3 from "web3";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode.react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import "../styles/globals.css";

// 🔥 Supabase Setup
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Donations() {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [totalDonated, setTotalDonated] = useState("0.00");
  const [loading, setLoading] = useState(false);
  const [impact, setImpact] = useState("🌍 Changing Lives...");

  const donationWallet = process.env.NEXT_PUBLIC_DONATION_WALLET;
  const donationContract = process.env.NEXT_PUBLIC_DONATION_CONTRACT_ADDRESS;

  const charityFunds = [
    { name: "🌱 Green Earth Fund", wallet: "0xGreenFund" },
    { name: "🧑‍⚕️ Medical Aid Foundation", wallet: "0xMedicalAid" },
    { name: "📚 Future Education Fund", wallet: "0xEduFund" },
  ];

  useEffect(() => {
    fetchUserAccount();
    fetchTotalDonations();
  }, []);

  useEffect(() => {
    if (!donationAmount) return;
    convertDonation();
  }, [donationAmount, currency]);

  const fetchUserAccount = async () => {
    const { data } = await supabase.from("users").select("wallet").single();
    if (data?.wallet) {
      setAccount(data.wallet);
      initializeWeb3();
    }
  };

  const initializeWeb3 = () => {
    const web3Instance = new Web3(window.ethereum);
    setWeb3(web3Instance);
  };

  const fetchTotalDonations = async () => {
    try {
      const { data, error } = await supabase
        .from("donations")
        .select("SUM(amount) as total")
        .single();

      if (!error && data.total) {
        setTotalDonated(data.total.toFixed(2));
      }
    } catch (error) {
      console.error("❌ Klaida gaunant donacijų statistiką:", error);
    }
  };

  const fetchConversionRate = async () => {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd,eur`
      );
      return response.data.binancecoin[currency.toLowerCase()];
    } catch (error) {
      console.error("❌ Klaida gaunant valiutos kursą:", error);
      return null;
    }
  };

  const convertDonation = async () => {
    const rate = await fetchConversionRate();
    if (rate) {
      setConvertedAmount((parseFloat(donationAmount) * rate).toFixed(2));
      calculateImpact(donationAmount);
    }
  };

  const calculateImpact = (amount) => {
    const peopleHelped = Math.floor(parseFloat(amount) * 12); 
    setImpact(`🌍 Your donation will support ~${peopleHelped} people!`);
  };

  const handleDonate = async () => {
    if (!donationAmount || !web3) return;

    try {
      setLoading(true);
      const sendAmount = web3.utils.toWei(donationAmount, "ether");

      await web3.eth.sendTransaction({
        from: account,
        to: donationContract,
        value: sendAmount,
        gas: 21000,
      });

      await supabase.from("donations").insert([
        {
          wallet: account,
          amount: donationAmount,
          currency: "BNB",
          converted_amount: convertedAmount,
          converted_currency: currency,
          timestamp: new Date().toISOString(),
        }
      ]);

      fetchTotalDonations();
      setDonationAmount("");
    } catch (error) {
      console.error("❌ Klaida donacijų procese:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="donations-container glass-card"
    >
      <Typography variant="h4" className="text-center mb-4 neon-text">
        ❤️ Change the World with Your Donation
      </Typography>
      <Typography className="text-center mb-6">
        Your donation is **fully transparent**, supporting **verified global funds**.
      </Typography>

      <Card className="glass-card">
        <CardContent>
          <Typography variant="h5" className="text-center glow-text">
            🌟 Total Donated: {totalDonated} BNB
          </Typography>
        </CardContent>
      </Card>

      <Box className="donation-form mt-6">
        <TextField
          label="Amount to Donate (BNB)"
          type="number"
          fullWidth
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          className="mb-4"
        />

        <Select
          fullWidth
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="mb-4"
        >
          <MenuItem value="EUR">💶 EUR</MenuItem>
          <MenuItem value="USD">💵 USD</MenuItem>
        </Select>

        {convertedAmount && (
          <Typography className="converted-amount text-center mb-4 neon-text">
            ≈ {convertedAmount} {currency}
          </Typography>
        )}

        <Typography className="impact-message text-center mb-4">
          {impact}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          className="donate-btn"
          onClick={handleDonate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "❤️ Donate Now"}
        </Button>
      </Box>

      <Typography variant="h5" className="text-center mt-6">
        📜 Verified Charity Funds
      </Typography>
      <Grid container spacing={3} className="mt-4">
        {charityFunds.map((fund) => (
          <Grid item xs={12} sm={4} key={fund.wallet}>
            <Card className="charity-card glass-card">
              <CardContent className="flex items-center justify-between">
                <Typography variant="body1">{fund.name}</Typography>
                <QRCode value={fund.wallet} size={50} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
}
