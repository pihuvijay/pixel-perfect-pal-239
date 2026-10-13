import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Send, Link2, ImageIcon, Type } from "lucide-react";
import { STOCKS, TIPS, DEMO_LINKS, DATA_AS_OF, detectPlatform, type Stock, type Tip } from "@/data/demoData";
import { WELCOME_MESSAGE, STARTER_CHIPS, GUARDRAIL, FALLBACK, TIP_FOLLOWUPS, matchQA, stockChips, type QA } from "@/data/wingmanQA";
import { WingLogo } from "./ui";
import { WhyMoved, MoneyTiles, TipResult } from "./Wingman";

type Ticker = Stock["ticker"];
export type ChatMsg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "user"; link: string }
  | { id: number; role: "user"; image: string }
  | { id: number; role: "bot"; typing: string }
  | { id: number; role: "bot"; qa: QA; ticker: Ticker }
  | { id: number; role: "bot"; text: string; followUps: string[] }
  | { id: number; role: "bot"; tip: Tip["id"]; post?: string };

let nextId = 1;
const URL_RE = /https?:\/\/\S+|(?:www\.)?(?:tiktok\.com|x\.com|twitter\.com|instagram\.com|youtube\.com|youtu\.be)\/\S*/i;

type Props = {
  messages: ChatMsg[];
  setMessages: (fn: (m: ChatMsg[]) => ChatMsg[]) => void;
  ticker: Ticker | null; // current stock page, if any
  amount: number;
  prelude?: ReactNode;
  onTour: () => void;
  onOpenTip: () => void;
  onShowStock: (t: Ticker) => void;
};

export function Chat(p: Props) {
  const [input, setInput] = useState("");
  const [menu, setMenu] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();
  const ctx = p.ticker ?? "NVDA";
  const company = STOCKS[ctx].name;

  useEffect(() => {
    const el = scrollRef.current;
    if (el && p.messages.length) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [p.messages, reduce]);

  const delay = (ms: number) => (reduce ? 0 : ms);

  const reply = (typing: string, ms: number, make: () => ChatMsg[]) => {
    const tid = nextId++;
    p.setMessages((m) => [...m, { id: tid, role: "bot", typing }]);
    setTimeout(() => p.setMessages((m) => [...m.filter((x) => x.id !== tid), ...make()]), delay(ms));
  };

  const sendLink = (url: string) => {
    p.setMessages((m) => [...m, { id: nextId++, role: "user", link: url }]);
    const demo = DEMO_LINKS.find((d) => url.replace(/\/$/, "").includes(d.url.replace(/^https?:\/\/(www\.)?/, "")));
    if (demo) reply("Reading the post…", 1200, () => [{ id: nextId++, role: "bot", tip: demo.tipId, post: demo.handle }]);
    else reply("", 800, () => [{ id: nextId++, role: "bot", text: "I can't read this post from the link yet. Paste the caption or upload a screenshot and I'll check it.", followUps: ["How do I spot an investment scam?", "Is this person being paid to post this?", "Saw a tip online? Check it"] }]);
  };

  const ask = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setInput("");
    setMenu(false);
    const url = text.match(URL_RE)?.[0];
    if (url) return sendLink(url);
    const t = text.toLowerCase();
    if (t === "show me around the app") return p.onTour();
    if (t === "saw a tip online? check it") return p.onOpenTip();
    const showMatch = Object.values(STOCKS).find((s) => t === `show me ${s.name.toLowerCase()}`);
    if (showMatch) return p.onShowStock(showMatch.ticker);

    p.setMessages((m) => [...m, { id: nextId++, role: "user", text }]);

    if (t === "check a tiktok or x post") {
      return reply("", 800, () => [{ id: nextId++, role: "bot", text: "Paste a link from TikTok, X, Instagram or YouTube below, or tap + for an example link. I'll check what the post claims.", followUps: [] }]);
    }
    // Pasted caption that matches an example tip
    const tipMatch = TIPS.find((tp) => tp.text.toLowerCase() === t);
    if (tipMatch) return reply("Checking…", 1200, () => [{ id: nextId++, role: "bot", tip: tipMatch.id }]);

    if (GUARDRAIL.triggers.some((g) => t.includes(g))) {
      return reply("", 800, () => [{ id: nextId++, role: "bot", text: GUARDRAIL.answer, followUps: GUARDRAIL.followUps }]);
    }
    const qa = matchQA(t);
    // A question naming a specific stock applies to that stock
    const named = Object.values(STOCKS).find((s) => t.includes(s.name.toLowerCase()) || t.includes(s.ticker.toLowerCase()));
    const tk = named?.ticker ?? ctx;
    if (qa) return reply("", 800, () => [{ id: nextId++, role: "bot", qa, ticker: tk }]);
    reply("", 800, () => [{ id: nextId++, role: "bot", text: FALLBACK.answer, followUps: FALLBACK.followUps }]);
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setMenu(false);
    p.setMessages((m) => [...m, { id: nextId++, role: "user", image: URL.createObjectURL(f) }]);
    reply("Reading the text in your screenshot…", 1500, () => [{ id: nextId++, role: "bot", tip: "A" }]);
  };

  const s = STOCKS[ctx];
  const chips = p.ticker ? stockChips(company, s.change1M < 0) : STARTER_CHIPS;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {p.prelude}
        <BotBubble>
          <p>{p.ticker ? `Got a question about ${company}? Ask me, or pick one below.` : WELCOME_MESSAGE}</p>
          <Chips items={chips} onPick={ask} />
        </BotBubble>
        {p.messages.map((m) => <Message key={m.id} m={m} amount={p.amount} onAsk={ask} onShowStock={p.onShowStock} />)}
        <p className="pt-2 text-center text-xs text-muted-foreground">Wingman explains, never advises. {DATA_AS_OF}.</p>
      </div>

      <div className="relative border-t bg-background px-3 py-3">
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full left-3 right-3 mb-2 space-y-1 rounded-3xl border bg-background p-2 shadow-soft" role="menu">
              <MenuItem icon={<Link2 size={18} />} label="Paste a link" sub="TikTok, X, Instagram, YouTube" onClick={() => { setMenu(false); setInput("https://"); inputRef.current?.focus(); }} />
              <MenuItem icon={<ImageIcon size={18} />} label="Upload a screenshot" onClick={() => fileRef.current?.click()} />
              <MenuItem icon={<Type size={18} />} label="Paste a caption" onClick={() => { setMenu(false); inputRef.current?.focus(); }} />
              <div className="border-t px-2 pt-2 text-xs font-semibold text-muted-foreground">Demo</div>
              <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                {DEMO_LINKS.map((d) => (
                  <button key={d.url} onClick={() => { setMenu(false); sendLink(d.url); }} className="min-h-9 rounded-full bg-secondary px-3 text-sm font-medium">{d.label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
          <button type="button" aria-label="Add a link, screenshot or caption" aria-expanded={menu} onClick={() => setMenu(!menu)}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary transition-transform ${menu ? "rotate-45" : ""}`}>
            <Plus size={20} />
          </button>
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about investing…" aria-label="Ask Wingman a question"
            className="h-11 min-w-0 flex-1 rounded-full border bg-secondary px-4 text-base outline-none focus:border-wing" />
          <button type="submit" aria-label="Send" disabled={!input.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-wing text-wing-foreground disabled:opacity-40">
            <Send size={18} />
          </button>
        </form>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
    </div>
  );
}

function MenuItem({ icon, label, sub, onClick }: { icon: ReactNode; label: string; sub?: string; onClick: () => void }) {
  return (
    <button role="menuitem" onClick={onClick} className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-secondary">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-wing-soft text-wing">{icon}</span>
      <span><span className="block font-semibold">{label}</span>{sub && <span className="block text-xs text-muted-foreground">{sub}</span>}</span>
    </button>
  );
}

function Chips({ items, onPick, label }: { items: string[]; onPick: (q: string) => void; label?: string }) {
  if (!items.length) return null;
  return (
    <div className="mt-3">
      {label && <p className="mb-2 text-sm font-semibold text-muted-foreground">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {items.map((c) => (
          <button key={c} onClick={() => onPick(c)} className="min-h-10 rounded-full border border-wing/40 bg-wing-soft px-3 py-1.5 text-left text-sm font-medium active:scale-95">{c}</button>
        ))}
      </div>
    </div>
  );
}

function BotBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
      <WingLogo size={28} />
      <div className="min-w-0 flex-1 rounded-3xl rounded-tl-md border bg-card p-4 text-base leading-relaxed">{children}</div>
    </motion.div>
  );
}

function UserBubble({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end">
      <div className="max-w-[80%] rounded-3xl rounded-tr-md bg-secondary px-4 py-2.5 text-base">{children}</div>
    </motion.div>
  );
}

function shortUrl(u: string) {
  const s = u.replace(/^https?:\/\/(www\.)?/, "");
  return s.length > 30 ? s.slice(0, 30) + "…" : s;
}

function Message({ m, amount, onAsk, onShowStock }: { m: ChatMsg; amount: number; onAsk: (q: string) => void; onShowStock: (t: Ticker) => void }) {
  if (m.role === "user") {
    if ("text" in m) return <UserBubble>{m.text}</UserBubble>;
    if ("image" in m) return <UserBubble><img src={m.image} alt="Your screenshot" className="max-h-48 rounded-2xl" /></UserBubble>;
    const platform = detectPlatform(m.link);
    return (
      <UserBubble>
        <div className="w-56">
          <div className="h-24 rounded-2xl bg-muted-foreground/15" aria-hidden />
          <span className="mt-2 inline-block rounded-full bg-background px-2 py-0.5 text-xs font-bold">{platform ?? "Link"}</span>
          <p className="mt-1 break-all text-sm text-muted-foreground">{shortUrl(m.link)}</p>
        </div>
      </UserBubble>
    );
  }
  if ("typing" in m) return (
    <div className="flex items-center gap-2" role="status" aria-live="polite" aria-label={m.typing || "Wingman is typing"}>
      <WingLogo size={28} />
      <div className="flex items-center gap-2 rounded-3xl rounded-tl-md border bg-card px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="h-2 w-2 rounded-full bg-wing" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15 }} />
        ))}
        {m.typing && <span className="ml-1 text-sm text-muted-foreground">{m.typing}</span>}
      </div>
    </div>
  );
  if ("qa" in m) {
    const st = STOCKS[m.ticker];
    const fix = (x: string) => x.replace(/Nvidia/g, st.name).replace("drop?", st.change1M < 0 ? "drop?" : "rise?");
    const special = m.qa.special;
    return (
      <BotBubble>
        <p>{m.qa.answer}</p>
        {special === "whyMoved" && <div className="mt-3"><WhyMoved s={st} /></div>}
        {special === "money" && <div className="mt-3"><MoneyTiles s={st} amount={amount} /></div>}
        {special === "whyMoved" ? (
          <p className="mt-3 rounded-2xl bg-wing-soft p-3 text-sm">{st.name} is {st.change1M < 0 ? "down" : "up"} {Math.abs(st.change1M)}% this month. £50 invested a month ago would now be worth about £{(50 * (1 + st.change1M / 100)).toFixed(0)}.</p>
        ) : (
          <p className="mt-3 rounded-2xl bg-wing-soft p-3 text-sm">{m.qa.example}</p>
        )}
        <Chips items={m.qa.followUps.map(fix)} onPick={onAsk} label="Questions you might have next" />
      </BotBubble>
    );
  }
  if ("tip" in m) {
    const tip = TIPS.find((t) => t.id === m.tip)!;
    const demo = DEMO_LINKS.find((d) => d.tipId === m.tip);
    return (
      <BotBubble>
        {m.post && demo && (
          <div className="mb-3 rounded-2xl border p-3">
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-full bg-muted-foreground/25" aria-hidden />
              <span className="font-semibold">{demo.handle}</span>
            </div>
            <p className="mt-2 text-sm">{tip.text}</p>
            <p className="mt-2 text-xs text-muted-foreground">♥ {demo.likes} · ↗ {demo.shares} shares</p>
          </div>
        )}
        <TipResult tip={tip} img={null} amount={amount} onShowStock={onShowStock} />
        <Chips items={TIP_FOLLOWUPS} onPick={onAsk} label="Questions you might have next" />
        <p className="mt-3 text-xs text-muted-foreground">Coming soon: share posts straight from TikTok or X to Wingman with your phone's share button.</p>
      </BotBubble>
    );
  }
  return (
    <BotBubble>
      <p>{m.text}</p>
      <Chips items={m.followUps} onPick={onAsk} label={m.followUps.length ? "Questions you might have next" : undefined} />
    </BotBubble>
  );
}
