import Link from "next/link";
import { motion } from "framer-motion";
import { FaTwitter, FaTelegram, FaGithub, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary text-white py-6 mt-12"
    >
      <div className="container mx-auto text-center">
        {/* Logotipas */}
        <motion.img
          src="/logo.png"
          alt="NordBaltic Pay"
          className="h-12 mx-auto mb-4"
          whileHover={{ scale: 1.1 }}
        />

        {/* Nuorodos */}
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/privacy">
            <span className="hover:text-secondary transition">Privacy Policy</span>
          </Link>
          <Link href="/terms">
            <span className="hover:text-secondary transition">Terms of Use</span>
          </Link>
          <Link href="/contact">
            <span className="hover:text-secondary transition">Contact</span>
          </Link>
        </div>

        {/* Socialiniai tinklai */}
        <div className="flex justify-center space-x-6 text-xl mb-4">
          <a href="https://twitter.com/NordBalticPay" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="hover:text-secondary transition" />
          </a>
          <a href="https://t.me/NordBalticPay" target="_blank" rel="noopener noreferrer">
            <FaTelegram className="hover:text-secondary transition" />
          </a>
          <a href="https://github.com/NordBaltic/NordBaltic-Pay" target="_blank" rel="noopener noreferrer">
            <FaGithub className="hover:text-secondary transition" />
          </a>
          <a href="https://discord.gg/NordBalticPay" target="_blank" rel="noopener noreferrer">
            <FaDiscord className="hover:text-secondary transition" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm opacity-70">
          &copy; {new Date().getFullYear()} NordBaltic Pay. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
