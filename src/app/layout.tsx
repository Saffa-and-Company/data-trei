import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import * as Toast from "@radix-ui/react-toast";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Data Trei",
  description:
    "Secure your B2B operations with advanced log tracking and threat intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Theme
          appearance="dark"
          accentColor="green"
          grayColor="sage"
          panelBackground="solid"
          scaling="100%"
        >
          <Toaster position="bottom-right" />
          {children}
        </Theme>
      </body>
    </html>
  );
}
