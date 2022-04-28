import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <MoralisProvider
        serverUrl={process.env.NEXT_PUBLIC_SERVERURL}
        appId={process.env.NEXT_PUBLIC_APPID}
      >
        <Component {...pageProps} />
      </MoralisProvider>
    </>
  );
}

export default MyApp;
