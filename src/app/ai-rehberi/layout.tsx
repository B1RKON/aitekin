import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yapay Zeka Nedir? | AI Rehberi | aitekin.com",
  description:
    "Yapay zeka nedir, nasıl çalışır? LLM, görsel üretimi, video, müzik ve ses yapay zekalarını basitçe öğren. Hiç bilmeyenler için 5 dakikada AI rehberi.",
  keywords: [
    "yapay zeka nedir",
    "AI nedir",
    "LLM nasıl çalışır",
    "görsel yapay zeka",
    "video yapay zeka",
    "müzik yapay zeka",
    "yapay zeka rehberi",
  ],
};

export default function AIRehberiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
