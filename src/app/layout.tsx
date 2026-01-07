import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitChrono | How much time have you spent coding?",
  description: "Analyze your GitHub repositories to estimate time spent on code with beautiful visualizations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="glow-bg" />
        {children}
      </body>
    </html>
  );
}
