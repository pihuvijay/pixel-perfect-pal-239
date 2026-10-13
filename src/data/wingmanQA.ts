// ============================================================
// Wingman chat knowledge base. Edit answers, examples and
// follow-ups here. Typed questions are matched by keywords.
// ============================================================

export type QA = {
  q: string;
  keywords: string[]; // lower-case; longer/more specific phrases score higher
  answer: string;
  example: string;
  followUps: string[];
  special?: "whyMoved" | "money";
};

export const WELCOME_MESSAGE = "Hi Sam, I'm Wingman. Ask me anything about investing. Not sure where to start? Pick one below.";

export const STARTER_CHIPS = [
  "What is investing?", "What's a share?", "What's an ETF?", "How much do I need to start?", "Can I lose money?",
  "What's a Stocks & Shares ISA?", "What fees will I pay?", "Show me around the app", "Saw a tip online? Check it",
  "Check a TikTok or X post",
];

export const stockChips = (company: string, down: boolean) => [
  `Why did ${company} ${down ? "drop" : "rise"}?`, "What does this mean for my £50?", "What's earnings season?", "Can I lose money?",
];

export const GUARDRAIL = {
  triggers: ["should i", "best stock", "will it go up", "will it rise", "will it fall", "go up", "recommend", "what to buy", "worth buying", "good investment"],
  answer: "I can't tell you what to buy or predict prices, but I can show you what's happening and what to consider.",
  followUps: ["Why did Nvidia drop?", "Can I lose money?", "ETF vs single share: what's the difference?"],
};

export const FALLBACK = {
  answer: "I don't have a good answer for that yet. Here are some things I can explain:",
  followUps: ["What is investing?", "What's an ETF?", "Can I lose money?"],
};

export const TIP_FOLLOWUPS = ["Is this person being paid to post this?", "How do I spot an investment scam?", "Why do share prices change?"];

export const QA_LIST: QA[] = [
  {
    q: "What is investing?",
    keywords: ["what is investing", "investing", "invest"],
    answer: "Investing means putting money into something, like a company, hoping it grows in value over time. Unlike a savings account, the value can go down as well as up. Most people invest for years, not days.",
    example: "If you invest £50 and it grows 5% in a year, it's worth £52.50. If it falls 5%, it's worth £47.50.",
    followUps: ["What's a share?", "What's an ETF?", "Can I lose money?"],
  },
  {
    q: "What's a share?",
    keywords: ["what's a share", "what is a share", "share", "stock"],
    answer: "A share is a small piece of ownership in a company. If the company does well, people may pay more for its shares. If it struggles, the price can fall.",
    example: "If a share costs £100 and you put in £50, you own half a share.",
    followUps: ["Why do share prices change?", "What's a dividend?", "What's an ETF?"],
  },
  {
    q: "What's an ETF?",
    keywords: ["etf", "fund", "index", "tracker"],
    answer: "An ETF (exchange-traded fund) is one thing you buy that holds lots of companies at once. Many follow an index, a list like the 500 biggest US companies. You buy and sell it like a share.",
    example: "If you put £50 into an ETF that holds 500 companies, a little of your £50 sits in each one.",
    followUps: ["ETF vs single share: what's the difference?", "What fees do ETFs have?", "What does diversification mean?"],
  },
  {
    q: "ETF vs single share: what's the difference?",
    keywords: ["etf vs", "vs single", "difference", "single share", "one company vs"],
    answer: "A single share ties your money to one company, so its news moves your whole investment. An ETF spreads money across many companies, so one bad result matters less. Neither is right for everyone.",
    example: "If one company drops 20%, £50 in that share falls to £40. In a 500-company ETF, that one drop barely moves your £50.",
    followUps: ["What does diversification mean?", "Can I lose money?", "How much do I need to start?"],
  },
  {
    q: "What does diversification mean?",
    keywords: ["diversification", "diversify", "spread"],
    answer: "Diversification means not putting all your eggs in one basket. Spreading money across different companies or areas means one bad result hurts less. It lowers risk but doesn't remove it.",
    example: "£50 split as £10 across 5 companies: if one halves, you lose £5, not £25.",
    followUps: ["What's an ETF?", "Can I lose money?", "What is investing?"],
  },
  {
    q: "How much do I need to start?",
    keywords: ["how much", "need to start", "minimum", "start with", "start"],
    answer: "On many apps you can start with very little, sometimes £1, thanks to fractional shares. There's no 'right' amount. A common rule is to only invest money you won't need soon.",
    example: "You can put £10 into a share that costs £300. You'd own a small slice of one share.",
    followUps: ["What are fractional shares?", "What fees will I pay?", "What's a Stocks & Shares ISA?"],
  },
  {
    q: "What are fractional shares?",
    keywords: ["fractional", "fraction", "part of a share", "whole share"],
    answer: "A fractional share is part of one share. It lets you invest a set £ amount instead of buying whole shares. Your slice goes up and down by the same % as a full share.",
    example: "If one share costs £136.80 and you put in £50, you own about 0.37 of a share.",
    followUps: ["How much do I need to start?", "What's a share?", "When can I sell?"],
  },
  {
    q: "Can I lose money?",
    keywords: ["lose money", "can i lose", "risk", "risky", "lose"],
    answer: "Yes. Prices can fall, and you could get back less than you put in. Over short periods, falls of 10% or more are common. Spreading your money and investing for longer can reduce, but not remove, that risk.",
    example: "If you put in £50 and the price falls 20%, your investment is worth £40.",
    followUps: ["Can I lose more than I put in?", "What does diversification mean?", "Why do share prices change?"],
  },
  {
    q: "Can I lose more than I put in?",
    keywords: ["more than i put in", "lose more", "more than £", "more than 50"],
    answer: "With ordinary shares and ETFs, the most you can lose is what you put in. With leveraged products like CFDs, losses can be bigger than your deposit. Tradely's normal investing doesn't use leverage.",
    example: "Put £50 into a share and the worst case is £0. With leverage, a bad move could cost you more than your £50.",
    followUps: ["What's leverage?", "What's a CFD?", "Can I lose money?"],
  },
  {
    q: "What's leverage?",
    keywords: ["leverage", "leveraged", "margin"],
    answer: "Leverage means borrowing to make your bet bigger. Gains are bigger, but so are losses. Small price moves can wipe out your money fast.",
    example: "At 5x leverage, your £50 acts like £250. A 20% drop loses £50, so your whole £50 is gone.",
    followUps: ["Can I lose more than I put in?", "ETF vs single share: what's the difference?", "What is investing?"],
  },
  {
    q: "What's a CFD?",
    keywords: ["cfd", "contract for difference"],
    answer: "A CFD (contract for difference) is a bet on a price moving, without owning the thing itself. CFDs usually use leverage, and most people who trade them lose money.",
    example: "A £50 CFD at 5x leverage on a share that drops 20% wipes out your £50.",
    followUps: ["Can I lose more than I put in?", "ETF vs single share: what's the difference?", "What is investing?"],
  },
  {
    q: "Why do share prices change?",
    keywords: ["why do share prices", "prices change", "price change", "why do prices", "prices move"],
    answer: "Prices change because people are constantly buying and selling. News, company results and the wider economy change how much people are willing to pay. More buyers push prices up; more sellers push them down.",
    example: "If good news makes lots of people want a £100 share, it might rise to £105 in a day. Your £50 would become £52.50.",
    followUps: ["What's earnings season?", "Why did Nvidia drop?", "What's volatility?"],
  },
  {
    q: "What's earnings season?",
    keywords: ["earnings", "results", "quarterly"],
    answer: "Earnings season is a few weeks each quarter when big companies report how much money they made. If results beat or miss what people expected, prices can move a lot in a day.",
    example: "A 10% jump after earnings would turn £50 into £55. A 10% drop would make it £45.",
    followUps: ["Why do share prices change?", "What's volatility?", "Why did Nvidia drop?"],
  },
  {
    q: "What's volatility?",
    keywords: ["volatility", "volatile", "swing"],
    answer: "Volatility is how much and how fast a price swings up and down. High volatility means bigger, quicker moves either way. Tech and young companies tend to be more volatile.",
    example: "A volatile share might move your £50 by £4 in a day. A calmer one might move it by 50p.",
    followUps: ["Can I lose money?", "What does diversification mean?", "Why do share prices change?"],
  },
  {
    q: "Why did Nvidia drop?",
    keywords: ["why did", "drop", "fall", "fell", "why did nvidia"],
    answer: "Here's what's been reported. Prices often react to several things at once, so no single reason tells the full story.",
    example: "Nvidia is down 12% this month. £50 invested a month ago would now be worth about £44.",
    followUps: ["What's earnings season?", "What would this mean for my £50?", "Show me Nvidia"],
    special: "whyMoved",
  },
  {
    q: "What would this mean for my £50?",
    keywords: ["my £50", "mean for my", "my 50", "for my money"],
    answer: "Here's how big normal and bad moves could be in £ terms, based on how this stock has moved before. Past moves don't predict the future.",
    example: "These are rough ranges, not forecasts.",
    followUps: ["Can I lose money?", "What's volatility?", "ETF vs single share: what's the difference?"],
    special: "money",
  },
  {
    q: "What's a dividend?",
    keywords: ["dividend", "payout"],
    answer: "A dividend is a share of a company's profits paid to its shareholders, usually a few times a year. Not every company pays one, and they can be cut.",
    example: "If a company pays 2% a year and you hold £50 of it, you'd get about £1 a year.",
    followUps: ["What's a share?", "What's an ETF?", "How much do I need to start?"],
  },
  {
    q: "What's a Stocks & Shares ISA?",
    keywords: ["isa", "tax", "tax-free"],
    answer: "A Stocks & Shares ISA is a UK account for investing where any growth isn't taxed. There's a yearly limit on how much you can put in. The investments inside can still go down.",
    example: "If your £50 grows to £60 inside an ISA, you keep the £10 gain without paying tax on it.",
    followUps: ["What fees will I pay?", "How much do I need to start?", "What's an ETF?"],
  },
  {
    q: "What fees will I pay?",
    keywords: ["fee", "fees", "cost", "charge", "fx"],
    answer: "Common costs: an FX fee when your £ is turned into $ for US stocks, the spread (a small gap between buying and selling prices), and yearly fund fees for ETFs. Small fees add up over time.",
    example: "A 0.5% FX fee on £50 is 25p each way. A 0.1% yearly ETF fee on £50 is 5p a year.",
    followUps: ["What's an ETF?", "What's a spread?", "How much do I need to start?"],
  },
  {
    q: "What fees do ETFs have?",
    keywords: ["etf fee", "fees do etf", "ongoing charge", "ocf"],
    answer: "ETFs charge a small yearly fee, often shown as a %. It's taken from the fund automatically, so you don't get a bill. Simple index ETFs are often cheaper than other funds.",
    example: "A 0.2% yearly fee on £50 is 10p a year.",
    followUps: ["What fees will I pay?", "What's an ETF?", "How much do I need to start?"],
  },
  {
    q: "What's a spread?",
    keywords: ["spread", "bid", "ask price"],
    answer: "The spread is the small gap between the price you can buy at and the price you can sell at. It's a hidden cost each time you trade.",
    example: "If you buy at £100.10 and could sell at £99.90 straight away, a £50 investment loses about 10p to the spread.",
    followUps: ["What fees will I pay?", "Why do share prices change?", "What's a share?"],
  },
  {
    q: "When can I sell?",
    keywords: ["when can i sell", "sell", "withdraw", "cash out"],
    answer: "You can sell any time the market is open. The price you get depends on the market at that moment, so it may be more or less than you paid. Money usually reaches your account in a couple of days.",
    example: "If you sell your £50 investment when it's worth £53, you get £53 minus any fees.",
    followUps: ["What fees will I pay?", "Why do share prices change?", "What's volatility?"],
  },
  {
    q: "Is this person being paid to post this?",
    keywords: ["paid to post", "being paid", "paid promotion", "sponsored", "influencer"],
    answer: "You often can't tell. UK rules say paid promotions must be clearly labelled, for example with #ad. Promoting investments without approval from an authorised firm can be illegal. If there's no label, be extra careful.",
    example: "If someone was paid £500 to hype a share, their post isn't a neutral view of whether it's right for your £50.",
    followUps: ["How do I spot an investment scam?", "Why do share prices change?", "Can I lose money?"],
  },
  {
    q: "How do I spot an investment scam?",
    keywords: ["scam", "spot a scam", "fraud", "fake"],
    answer: "Common warning signs: guaranteed returns, pressure to act fast, being asked to message privately, and unknown platforms or apps. Before sending money, check the firm on the FCA Warning List.",
    example: "'Turn £50 into £500 this week, DM me' ticks several of these boxes.",
    followUps: ["Is this person being paid to post this?", "Can I lose money?", "What is investing?"],
  },
];

/** Picks the best-matching answer for a typed question, or undefined. */
export function matchQA(text: string): QA | undefined {
  const t = text.toLowerCase().replace(/[’']/g, "'");
  const exact = QA_LIST.find((x) => x.q.toLowerCase() === t);
  if (exact) return exact;
  let best: QA | undefined;
  let score = 0;
  for (const qa of QA_LIST) {
    const s = qa.keywords.reduce((acc, k) => (t.includes(k) ? acc + k.length : acc), 0);
    if (s > score) { score = s; best = qa; }
  }
  return best;
}
