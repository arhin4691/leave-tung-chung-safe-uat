import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="zh-Hant">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/logo192.png"></link>
        <meta name="theme-color" content="#fff" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3107922640573943"
          strategy="lazyOnload"
          crossorigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
        <div id="backdrop-hook"></div>
        <div id="modal-hook"></div>
      </body>
    </Html>
  );
}
