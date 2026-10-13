import { createFileRoute } from "@tanstack/react-router";
import { TradelyApp } from "@/components/tradely/TradelyApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tradely — Investing, explained" },
      { name: "description", content: "A demo trading app. Investing, explained in plain English." },
      { property: "og:title", content: "Tradely — Investing, explained" },
      { property: "og:description", content: "A demo of Tradely. Investing, explained in plain English." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TradelyApp,
});
