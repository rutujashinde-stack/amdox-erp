import "./globals.css";

export const metadata = {
  title: "Amdox ERP",
  description: "AI-Powered Cloud ERP Suite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}