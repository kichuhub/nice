import "./globals.css";

export const metadata = {
  title: "Potluck Bazaar | Good food, good mood",
  description: "Discover feel-good snacks, sweet treats, drinks and pantry favorites at Potluck Bazaar. Good food tastes better when it’s shared.",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#fff6e5" };

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
