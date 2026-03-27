import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "@/lib/theme/context";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | aitekin.com",
    default: "aitekin.com | Ücretsiz AI Araçları Platformu",
  },
  description:
    "Yapay zeka araçlarını ücretsiz kullan. Video dönüştürme, müzik üretme, PDF analizi, AI sohbet ve daha fazlası. Tamamen ücretsiz, açık kaynaklı.",
  keywords: [
    "yapay zeka",
    "AI araçları",
    "ücretsiz",
    "video dönüştürme",
    "müzik üretme",
    "PDF analizi",
    "AI sohbet",
    "görsel oluşturma",
    "OCR",
    "aitekin",
  ],
  openGraph: {
    title: "aitekin.com | Ücretsiz AI Araçları Platformu",
    description: "Yapay zeka araçlarını ücretsiz kullan. Tamamen tarayıcında çalışır, gizlilik öncelikli.",
    url: "https://aitekin.com",
    siteName: "aitekin.com",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "aitekin.com | Ücretsiz AI Araçları",
    description: "Yapay zeka araçlarını ücretsiz kullan. Tamamen tarayıcında çalışır.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  metadataBase: new URL("https://aitekin.com"),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${jetbrainsMono.variable} h-full`} data-theme="aitekin-dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-mono bg-base-100 text-text-primary antialiased">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
