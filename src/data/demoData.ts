// ============================================================
// Tradely + Wingman demo data. Edit everything here.
// All prices are USD; shown to users in GBP via GBP_RATE.
// ============================================================

export const DATA_AS_OF = "Data as of 13 Oct 2026";
export const GBP_RATE = 0.75; // 1 USD = 0.75 GBP
export const USER_NAME = "Sam";
export const DEFAULT_AMOUNT = 50;

export type Timeframe = "1D" | "1W" | "1M" | "3M" | "6M" | "YTD" | "1Y";
export const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "3M", "6M", "YTD", "1Y"];

export type Reason = { text: string; sourceName: string; date: string; url: string };

export type Stock = {
  ticker: "NVDA" | "TSLA" | "AAPL";
  name: string;
  logoColor: string; // any CSS colour
  price: number; // USD
  todayChange: number; // USD
  todayPct: number; // %
  change1M: number; // %
  change1Y: number; // %
  periodPct: Record<Timeframe, number>; // % change over each timeframe
  typicalDailyMovePct: number;
  badDayMovePct: number;
  badYearPct: number;
  about: string; // wrap jargon words in [[double brackets]]
  whyItMoved: Reason[];
  series: Record<Timeframe, number[]>;
};

export const JARGON: Record<string, { explanation: string; example: string }> = {
  earnings: {
    explanation: "How much profit a company made over the last few months.",
    example: "If Apple says it earned more than expected, its price often jumps.",
  },
  volatility: {
    explanation: "How much and how quickly a price swings up and down.",
    example: "A share that moves 5% in a day is more volatile than one that moves 0.5%.",
  },
  "market cap": {
    explanation: "The total value of all of a company's shares added together.",
    example: "1 billion shares at $100 each = a $100 billion market cap.",
  },
  share: {
    explanation: "A small piece of ownership in a company.",
    example: "Owning 1 Tesla share means you own a tiny slice of Tesla.",
  },
  chips: {
    explanation: "The tiny computer processors inside phones, cars and data centres.",
    example: "Nvidia's chips power many AI tools.",
  },
};

// Smooth, plausible, deterministic series from start → end
function makeSeries(end: number, pct: number, n: number, seed: number, vol: number): number[] {
  const start = end / (1 + pct / 100);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = start + (end - start) * (t * t * (3 - 2 * t) * 0.5 + t * 0.5);
    const noise =
      (Math.sin(i * 0.9 + seed) * 0.6 + Math.sin(i * 0.31 + seed * 2.1) * 1.1 + Math.sin(i * 2.3 + seed * 0.5) * 0.25) *
      vol *
      start *
      Math.sin(Math.PI * t);
    out.push(Number((base + noise).toFixed(2)));
  }
  return out;
}

function buildSeries(price: number, p: Record<Timeframe, number>, seed: number, vol: number) {
  const pts: Record<Timeframe, number> = { "1D": 40, "1W": 35, "1M": 30, "3M": 45, "6M": 50, YTD: 55, "1Y": 60 };
  const out = {} as Record<Timeframe, number[]>;
  TIMEFRAMES.forEach((tf, k) => (out[tf] = makeSeries(price, p[tf], pts[tf], seed + k, vol)));
  return out;
}

const NVDA_P: Record<Timeframe, number> = { "1D": -1.4, "1W": -4.2, "1M": -12, "3M": -6, "6M": 18, YTD: 22, "1Y": 40 };
const TSLA_P: Record<Timeframe, number> = { "1D": 1.9, "1W": 3.1, "1M": 6, "3M": -2, "6M": -11, YTD: -5, "1Y": -8 };
const AAPL_P: Record<Timeframe, number> = { "1D": 0.6, "1W": 0.9, "1M": 2, "3M": 5, "6M": 9, YTD: 11, "1Y": 15 };

export const STOCKS: Record<Stock["ticker"], Stock> = {
  NVDA: {
    ticker: "NVDA",
    name: "Nvidia",
    logoColor: "oklch(0.62 0.17 140)",
    price: 182.4,
    todayChange: -2.59,
    todayPct: -1.4,
    change1M: -12,
    change1Y: 40,
    periodPct: NVDA_P,
    typicalDailyMovePct: 2.5,
    badDayMovePct: 8,
    badYearPct: 50,
    about:
      "Nvidia designs [[chips]] that power gaming, data centres and AI. It is one of the world's biggest companies by [[market cap]]. Its price often swings sharply around [[earnings]], so expect higher [[volatility]] than most.",
    whyItMoved: [
      { text: "PLACEHOLDER: Shares fell after reports of new export limits on AI chips.", sourceName: "Example News", date: "10 Oct 2026", url: "https://example.com" },
      { text: "PLACEHOLDER: Investors are cautious ahead of next month's earnings.", sourceName: "Example Wire", date: "8 Oct 2026", url: "https://example.com" },
      { text: "PLACEHOLDER: Wider tech stocks dipped this month.", sourceName: "Example Markets", date: "6 Oct 2026", url: "https://example.com" },
    ],
    series: buildSeries(182.4, NVDA_P, 1, 0.035),
  },
  TSLA: {
    ticker: "TSLA",
    name: "Tesla",
    logoColor: "oklch(0.58 0.2 25)",
    price: 428.1,
    todayChange: 7.98,
    todayPct: 1.9,
    change1M: 6,
    change1Y: -8,
    periodPct: TSLA_P,
    typicalDailyMovePct: 3.5,
    badDayMovePct: 10,
    badYearPct: 60,
    about:
      "Tesla makes electric cars, batteries and solar products. Each [[share]] has historically moved a lot day to day, so it has high [[volatility]]. News about deliveries and [[earnings]] often moves the price.",
    whyItMoved: [
      { text: "PLACEHOLDER: Quarterly deliveries came in above expectations.", sourceName: "Example News", date: "3 Oct 2026", url: "https://example.com" },
      { text: "PLACEHOLDER: Comments from the CEO about new models lifted interest.", sourceName: "Example Wire", date: "9 Oct 2026", url: "https://example.com" },
    ],
    series: buildSeries(428.1, TSLA_P, 4, 0.04),
  },
  AAPL: {
    ticker: "AAPL",
    name: "Apple",
    logoColor: "oklch(0.35 0.01 260)",
    price: 247.6,
    todayChange: 1.48,
    todayPct: 0.6,
    change1M: 2,
    change1Y: 15,
    periodPct: AAPL_P,
    typicalDailyMovePct: 1.5,
    badDayMovePct: 5,
    badYearPct: 30,
    about:
      "Apple makes the iPhone, Mac and services like the App Store. It has one of the largest [[market cap]] values in the world. Its [[share]] price usually has lower [[volatility]] than younger tech firms.",
    whyItMoved: [],
    series: buildSeries(247.6, AAPL_P, 7, 0.02),
  },
};

export const TRENDING: Stock["ticker"][] = ["NVDA", "TSLA", "AAPL"];

export type RedFlag = "Pushes you to hurry" | "Promises an outcome" | "No risks mentioned" | "Paid promotion not labelled?";

export type Tip = {
  id: "A" | "B" | "C";
  text: string;
  keywords: string[];
  scam: boolean;
  ticker?: Stock["ticker"];
  flags: { phrase: string; label: RedFlag }[];
  claim?: string;
  facts?: string;
  unknown?: string;
  scamSigns?: string[];
};

export const TIPS: Tip[] = [
  {
    id: "A",
    text: "Nvidia is about to explode, get in before earnings 🚀",
    keywords: ["nvidia", "nvda"],
    scam: false,
    ticker: "NVDA",
    flags: [
      { phrase: "about to explode", label: "Promises an outcome" },
      { phrase: "get in before earnings", label: "Pushes you to hurry" },
      { phrase: "🚀", label: "No risks mentioned" },
      { phrase: "Nvidia", label: "Paid promotion not labelled?" },
    ],
    claim: "Price will rise fast after earnings.",
    facts: "Price $182.40 (≈£136.80), down 12% this month. Next earnings expected in November.",
    unknown: "Nobody knows what the price will do next.",
  },
  {
    id: "B",
    text: "Tesla will double by Christmas, trust me",
    keywords: ["tesla", "tsla"],
    scam: false,
    ticker: "TSLA",
    flags: [
      { phrase: "will double by Christmas", label: "Promises an outcome" },
      { phrase: "trust me", label: "No risks mentioned" },
    ],
    claim: "Price will double in about 10 weeks.",
    facts: "Price $428.10 (≈£321.08), up 6% this month, down 8% over a year.",
    unknown: "Nobody knows what the price will do next.",
  },
  {
    id: "C",
    text: "Our AI trading bot makes 3% a day GUARANTEED. DM me to join 💰",
    keywords: ["guaranteed", "bot", "dm me"],
    scam: true,
    flags: [],
    scamSigns: ["Guaranteed returns", "Asks you to message privately", "Unknown platform", "Pressure to act"],
  },
];

export const QUESTIONS: { q: string; a: string }[] = [
  { q: "What's earnings season?", a: "A few weeks each quarter when companies report their profits. Prices often move a lot then." },
  { q: "Can I lose more than £50?", a: "No. With a normal share purchase, the most you can lose is what you put in." },
  { q: "When can I sell?", a: "Any time the market is open. The price you get may be higher or lower than what you paid." },
  { q: "Why do prices change every second?", a: "Millions of people are buying and selling. Each trade sets a new price." },
];

export const PAUSE_QUESTIONS = [
  "Could you afford to lose this £50?",
  "Do you know why you're buying it?",
  "Are you planning to keep it for a while?",
];

export const LINKS = {
  moneyHelper: "https://www.moneyhelper.org.uk",
  fcaWarning: "https://www.fca.org.uk/scamsmart/warning-list",
  scamSmart: "https://www.fca.org.uk/scamsmart",
};

// Demo social links → example tips. Handles are made up.
export type Platform = "TikTok" | "X" | "Instagram" | "YouTube";
export const DEMO_LINKS: { label: string; url: string; tipId: Tip["id"]; handle: string; likes: string; shares: string }[] = [
  { label: "Example TikTok link", url: "https://www.tiktok.com/@moneymoves_daily/video/123", tipId: "A", handle: "@moneymoves_daily", likes: "48.2K", shares: "3.1K" },
  { label: "Example X link", url: "https://x.com/trader_jay/status/456", tipId: "B", handle: "@trader_jay", likes: "12.7K", shares: "2.4K" },
  { label: "Example Instagram link", url: "https://www.instagram.com/p/789", tipId: "C", handle: "@ai_profit_club", likes: "9.8K", shares: "870" },
];

export function detectPlatform(url: string): Platform | null {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return "TikTok";
  if (u.includes("x.com") || u.includes("twitter.com")) return "X";
  if (u.includes("instagram.com")) return "Instagram";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "YouTube";
  return null;
}

export const TOUR_STEPS = [
  { id: "price", text: "This is what one share costs right now." },
  { id: "chart", text: "This shows how the price has moved. Green means up over this period, red means down." },
  { id: "jargon", text: "Tap any underlined word and I'll explain it." },
  { id: "amount", text: "You don't need to buy a whole share. £50 works here." },
  { id: "invest", text: "Before anything happens, I'll show you what you need to know." },
];

export const gbp = (usd: number) => usd * GBP_RATE;
export const fmtGBP = (n: number, dp = 2) => `£${n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;
export const fmtUSD = (n: number) => `$${n.toFixed(2)}`;
