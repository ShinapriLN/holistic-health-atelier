import { Nunito, Bagel_Fat_One } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});


export const metadata = {
  title: "Holistic Health Atelier - Cooking Game",
  description:
    "A cozy anime-style cooking game where you mix ingredients to discover healthy recipes!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={nunito.className}>{children}</body>
    </html>
  );
}
