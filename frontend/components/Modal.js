// 📂 /frontend/components/Modal.js - Modal langas pranešimams ir patvirtinimams
import '../styles.css';

export default function Modal({ title, message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
