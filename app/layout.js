import "./globals.css";
import { Space_Grotesk, DM_Serif_Display } from "next/font/google";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const dm = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-dm" });

export const metadata = {
  title: "OXO Online",
  description: "Invite-by-link multiplayer OXO"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${space.variable} ${dm.variable}`}>
      <body>{children}</body>
    </html>
  );
}
