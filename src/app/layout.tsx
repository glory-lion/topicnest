import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TopicNest - Join the conversation",
  description: "TopicNest is a community platform where you can share your thoughts, join conversations, and connect with people who share your interests.",
  keywords: ["forum", "community", "discussion", "social", "TopicNest"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
