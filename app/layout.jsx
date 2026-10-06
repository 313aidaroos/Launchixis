import "./globals.css";
import Cixy from "./cixy.jsx";
import StudioShell from "../components/StudioShell";
import "./studio.css";

export const metadata = {
  title: "Launchixis — Your launch studio",
  description:
    "Your idea. A clear direction. A private workspace, practical launch checklist, and guidance from Cixy.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StudioShell>{children}</StudioShell>
        <Cixy />
      </body>
    </html>
  );
}
