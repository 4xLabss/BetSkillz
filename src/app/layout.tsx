import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { WalletProvider as SolanaWalletProvider } from "@/components/SolanaWalletProvider";
import { PresenceProvider } from "@/components/PresenceProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BetSkillz - Web3 Gaming Hub",
  description: "The ultimate destination for competitive browser-based gaming with Web3 integration. Play Cosmic Drift, Cellularity, Voidfall and more!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f0f23] text-white`}
      >
        <SolanaWalletProvider>
          <WalletProvider>
            <PresenceProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
            </PresenceProvider>
          </WalletProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
