import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NavButton from "@/shared/components/ui/NavButton";
import ToastProvider from "@/shared/components/ui/ToastProvider";
import { ThemeProvider } from "@/shared/context/theme-context";
import { LocaleProvider } from "@/shared/context/locale-context";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "東涌出行",
  description: "Welcome to Leave Tung Chung Safe App",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Anti-flash: apply saved theme before first paint (dark default). */
const themeScript = `(function(){try{var t=localStorage.getItem('themeV2');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Use a darker theme-color that suits the glass aesthetic */}
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#080d18"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#dce8f8"
        />
        <link rel="apple-touch-icon" href="/logo192.png" />
        {/* Inter font — loaded here instead of globals.css @import so
            Turbopack's CSS parser doesn't reject the .. range notation */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap"
        />
      </head>
      <body>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3107922640573943"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <ThemeProvider>
          <LocaleProvider>
            <div className="app-content">{children}</div>
            <NavButton />
            <ToastProvider />
            <div id="backdrop-hook" />
            <div id="modal-hook" />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
