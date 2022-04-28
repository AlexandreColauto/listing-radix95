import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { useMoralis } from "react-moralis";

export default function Home() {
  const { authenticate, isAuthenticated } = useMoralis();
  const handleClick = (e) => {
    authenticate();
  };
  return (
    <div className={styles.container}>
      {!isAuthenticated ? (
        <button onClick={handleClick}>authenticate</button>
      ) : (
        <>
          <Link href={"/browser"}>
            <button>browser</button>
          </Link>
          <Link href={"/listing"}>
            <button>listing</button>
          </Link>
        </>
      )}
    </div>
  );
}
