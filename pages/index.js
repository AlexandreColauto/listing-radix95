import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useMoralis } from "react-moralis";

export default function Home() {
  const { authenticate } = useMoralis();

  const handleClick = (e) => {
    authenticate();
  };
  return (
    <div className={styles.container}>
      <button onClick={handleClick}>authenticate</button>
    </div>
  );
}
