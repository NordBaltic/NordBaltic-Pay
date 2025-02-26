import "../styles/globals.css";

export default function Loader({ message = "Loading..." }) {
  return (
    <div className="loader-wrapper">
      <div className="glowing-spinner"></div>
      <p className="loader-text">{message}</p>
    </div>
  );
}
