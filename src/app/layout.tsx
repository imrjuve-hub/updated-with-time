import './globals.css';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LoL Duo Match Finder',
  description: 'Find the latest shared match and view a clean scoreboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
