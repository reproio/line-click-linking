import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LINE クリック連携デモ",
  description: "Repro Web SDK を使った LINE 簡単ID連携のデモアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Repro Web SDK セットアップ */}
        <Script
          id="repro-sdk"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
!function(o,e,n){var r=[];if(window.reproio)console.info("Repro Web SDK was loaded more than once");else{window.reproio=function(){r.push(arguments)};var i=o.createElement(e),t=o.getElementsByTagName(e)[0];i.src="https://cdn.reproio.com/web/v2/repro-sdk.min.js",i.async=!0,i.crossOrigin="",i.onload=function(){window.reproio("setSnippetVersion","2.1"),r.forEach(function(o){window.reproio.apply(window.reproio,o)})},t.parentNode.insertBefore(i,t)}}(document,"script");
reproio("setup", "234eb3e6-85ab-4978-a359-108908136ab2");
reproio("track", "PageView");
            `,
          }}
        />
      </body>
    </html>
  );
}
