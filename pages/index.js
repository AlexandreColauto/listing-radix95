import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { useMoralis } from "react-moralis";
import {Fieldset,Button } from "react95";

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
        <Fieldset label="Select one">
          <Link href={"/browser"}>
            <Button fullWidth>BROWSER</Button>
          </Link>
          <Link href={"/listing"}>
            <Button fullWidth>LISTING</Button>
          </Link>
          </Fieldset>
        </>
      )}
    </div>
  );
}
