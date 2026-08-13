import type { Metadata } from "next";
import { Jost, Newsreader } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Tusenbruk — Earn the wear",
    template: "%s · Tusenbruk",
  },
  description:
    "A publication about the relationship between a person and the objects they use — watches, cameras, pens, cars, luggage. Not reviews. Portraits.",
  metadataBase: new URL("https://tusenbruk.com"),
  openGraph: {
    title: "Tusenbruk — Earn the wear",
    description:
      "A publication about the relationship between a person and the objects they use. Not reviews. Portraits.",
    type: "website",
    siteName: "Tusenbruk",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${newsreader.variable}`}>
      <body>
        <Header />
        <main className="wrap page">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
