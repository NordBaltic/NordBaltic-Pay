import styles from "../styles/Home.module.css"; // ✅ Turi būti frontend/styles/Home.module.css

export default function Home() {
  return (
    <div className={styles.container}>
      <h1>Welcome to NordBaltic Pay</h1>
    </div>
  );
}
