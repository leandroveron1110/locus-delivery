import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { RealtimeInitializer } from "./RealtimeInitializer";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Hunay Delivery",
  description: "la plataforma de tu ciudad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <RealtimeInitializer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
