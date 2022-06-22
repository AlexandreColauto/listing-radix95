import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import React from "react";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import styled from "styled-components";
import { styleReset } from "react95";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableHeadCell,
  TableDataCell,
  Button,
  Window,
  WindowHeader,
  WindowContent,
} from "react95";
// pick a theme of your choice
import original from "react95/dist/themes/original";
// original Windows95 font (optionally)

const GlobalStyles = createGlobalStyle`
.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.close-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-left: -1px;
  margin-top: -1px;
  transform: rotateZ(45deg);
  position: relative;
  &:before,
  &:after {
    content: '';
    position: absolute;
    background: ___CSS_1___;
  }

  body {
    font-family: 'ms_sans_serif';
  }
  ${styleReset}
`;
//FRONTEND
const Wrapper = styled.div``;

function MyApp({ Component, pageProps }) {
  return (
    <>
      <div>
        <GlobalStyles />
        <ThemeProvider theme={original}>
          <Window style={{ width: 600 }}>
            <WindowHeader className="window-header">
              <span>Listing.exe</span>
              <Button>
                <span className="close-icon" />
              </Button>
            </WindowHeader>
            <WindowContent>
              <MoralisProvider
                serverUrl={process.env.NEXT_PUBLIC_SERVERURL}
                appId={process.env.NEXT_PUBLIC_APPID}
              >
                <Component {...pageProps} />
              </MoralisProvider>
            </WindowContent>
          </Window>
        </ThemeProvider>
      </div>
    </>
  );
}

export default MyApp;
