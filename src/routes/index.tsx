import { createFileRoute } from "@tanstack/react-router";
import { TradelyApp } from "@/components/tradely/TradelyApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tradely with Wingman — Investing, explained" },
      { name: "description", content: "A demo trading app with Wingman, a plain-English guide that explains, never advises." },
      { property: "og:title", content: "Tradely with Wingman" },
      { property: "og:description", content: "Investing, explained. A demo of Wingman, the guide built into Tradely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TradelyApp,
});
