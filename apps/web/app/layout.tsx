import "./globals.css";

export const metadata = {
  title: "Master Oscar AI",
  description: "AI-native application engineering platform"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
