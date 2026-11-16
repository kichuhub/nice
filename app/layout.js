import "./globals.css";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

export const metadata = {
  title: "Potluck Bazaar | Good food, good mood",
  description: "Discover feel-good snacks, sweet treats, drinks and pantry favorites at Potluck Bazaar. Good food tastes better when it’s shared.",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#fff6e5" };

export default function RootLayout({ children }) {
  return <html lang="en" className={`${bricolage.variable} ${figtree.variable}`}><body>{children}</body></html>;
}
