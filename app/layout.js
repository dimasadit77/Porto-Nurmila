import { Urbanist, DM_Sans } from "next/font/google";
import "./globals.css";

const serif = Urbanist({ subsets: ["latin"], variable: "--font-serif" });
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });

export const metadata = {
  title: "Portofolio | HR & Development",
  description: "Portofolio profesional di bidang Human Resource & Development.",
};

// Jalan sebelum halaman tampil, supaya tema nggak berkedip saat dimuat
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}