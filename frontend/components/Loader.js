// 📂 /components/Loader.js
export default function Loader({ message }) {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}
