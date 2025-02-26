import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import "../styles/globals.css";

// ✅ Dinaminis `Analytics` importavimas (pagerina našumą)
const AnalyticsComponent = dynamic(() => import("../components/Analytics"), {
  ssr: false, // Išjungiamas SSR, kad `Chart.js` veiktų teisingai
});

const AnalyticsPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await axios.get("/api/admin/check", {
        headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` },
      });

      setIsAdmin(response.data.isAdmin);
      setLoading(false);
    } catch (error) {
      console.error("⚠️ Admin check failed:", error);
      setLoading(false);
    }
  };

  if (loading) return <p className="loading">🔄 Loading analytics page...</p>;

  if (!isAdmin) {
    return (
      <div className="analytics-container">
        <h1>🚨 Access Denied</h1>
        <p>🔒 You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="analytics-page-container">
      <h1>📊 System Analytics Dashboard</h1>
      <AnalyticsComponent />
    </div>
  );
};

export default AnalyticsPage;
