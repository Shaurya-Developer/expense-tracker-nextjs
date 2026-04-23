import "./globals.css";

export const metadata = {
  title: "Expense Tracker",
  description: "Track your personal expenses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
