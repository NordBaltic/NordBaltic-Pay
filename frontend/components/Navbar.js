import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import WalletConnectButton from "./WalletConnectButton";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all ${
        isScrolled ? "bg-primary shadow-dark" : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* LOGOTIPAS */}
        <Link href="/">
          <motion.img
            src="/logo.png"
            alt="NordBaltic Pay"
            className="h-10 cursor-pointer"
            whileHover={{ scale: 1.1 }}
          />
        </Link>

        {/* NAVIGACIJOS NUORODOS */}
        <div className="hidden md:flex space-x-6">
          <Link href="/dashboard">
            <span
              className={`text-white hover:text-secondary transition ${
                router.pathname === "/dashboard" ? "border-b-2 border-secondary" : ""
              }`}
            >
              Dashboard
            </span>
          </Link>
          <Link href="/staking">
            <span
              className={`text-white hover:text-secondary transition ${
                router.pathname === "/staking" ? "border-b-2 border-secondary" : ""
              }`}
            >
              Staking
            </span>
          </Link>
          <Link href="/donations">
            <span
              className={`text-white hover:text-secondary transition ${
                router.pathname === "/donations" ? "border-b-2 border-secondary" : ""
              }`}
            >
              Donations
            </span>
          </Link>
          <Link href="/transactions">
            <span
              className={`text-white hover:text-secondary transition ${
                router.pathname === "/transactions" ? "border-b-2 border-secondary" : ""
              }`}
            >
              Transactions
            </span>
          </Link>
        </div>

        {/* WALLET PRISIJUNGIMAS */}
        <WalletConnectButton />
      </div>
    </motion.nav>
  );
}
