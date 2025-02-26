import Settings from "../components/Settings";
import "../styles/globals.css";

export default function SettingsPage() {
  return (
    <div className="settings-page">
      <h1>⚙️ User Settings</h1>
      <p>Manage your theme, security settings, and currency preferences.</p>
      <Settings />
    </div>
  );
}
