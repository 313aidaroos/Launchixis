import "./globals.css";
import Cixy from "./cixy.jsx";

export const metadata = {
  title: "Launchixis — Launch board",
  description:
    "Launch operations for Apixis-family companies. One company at a time.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Special+Elite&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Cixy />
      </body>
    </html>
  );
}
