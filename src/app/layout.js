import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import HelpButton from '@/components/shared/HelpButton';
import MaintenanceMode from '@/components/shared/MaintenanceMode';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GroandInvest - USDT Investment Platform",
  description: "Invest in USDT and earn daily interest with referral bonuses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SettingsProvider>
          <AuthProvider>
            <MaintenanceMode />
            {children}
            <HelpButton />
          </AuthProvider>
        </SettingsProvider>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
