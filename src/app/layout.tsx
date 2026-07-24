import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  variable: "--font-roboto",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hospital Greguito - Gestão Hospitalar",
  description: "Sistema de gestão hospitalar completo com interface moderna e intuitiva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${roboto.variable} ${robotoMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-blue-600/20 selection:text-blue-600">
        {children}
      </body>
    </html>
  );
}
