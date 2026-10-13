import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Maximize2, Minimize2, ExternalLink, ChevronDown, Upload, ShieldAlert, Check } from "lucide-react";
import {
  STOCKS, TIPS, QUESTIONS, PAUSE_QUESTIONS, LINKS, DATA_AS_OF, fmtGBP, type Stock, type Tip,
} from "@/data/demoData";
import { LineChart, WingLogo } from "./ui";

export type WingView =
  | { kind: "home" }
  | { kind: "stock"; ticker: Stock["ticker"] }
  | { kind: "pause"; ticker: Stock["ticker"] }
  | { kind: "learned"; ticker: Stock["ticker"]; confirmed: boolean }
  | { kind: "tip" };

type Props = {
  open: boolean;
  expanded: boolean;
  view: WingView;
  amount: number;
  onMinimise: () => void;
  onToggleExpand: () => void;
  onShowHow: () => void;
  onOpenTip: () => void;
  onShowStock: (t: Stock["ticker"]) => void;
  onConfirm: (t: Stock["ticker"]) => void;
  onNotNow: (t: Stock["ticker"]) => void;
};

function Card({ title, children, tone = "default" }: { title?: string; children: ReactNode; tone?: "default" | "wing" | "danger" }) {
  const toneCls = tone === "wing" ? "bg-wing-soft" : tone === "danger" ? "bg-down-soft border-down/30" : "bg-card";
  return (
    <section className={`rounded-3xl border p-4 ${toneCls}`}>
      {title && <h3 className="mb-2 text-base font-bold">{title}</h3>}
      <div className="text-base leading-relaxed">{children}</div>
    </section>
  );
}

export function WingmanPanel(p: Props) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {p.open && (
        <motion.div
          role="dialog" aria-label="Wingman guide"
          initial={{ y: "100%" }} animate={{ y: 0, height: p.expanded ? "100%" : "56%" }} exit={{ y: "100%" }}
          transition={reduce ? { duration: 0 } : { type: "spring", damping: 30, stiffness: 280 }}
          className="absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-background shadow-panel"
        >
          <header className="flex items-center gap-3 border-b px-5 py-3">
            <WingLogo size={36} />
            <span className="flex-1 text-lg font-bold">Wingman</span>
            <button aria-label="Minimise Wingman" onClick={p.onMinimise} className="grid h-11 w-11 place-items-center rounded-full bg-secondary"><Minus size={18} /></button>
            <button aria-label={p.expanded ? "Return to half screen" : "Expand Wingman to full screen"} onClick={p.onToggleExpand} className="grid h-11 w-11 place-items-center rounded-full bg-secondary">
              {p.expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </header>
          <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <PanelBody {...p} />
            <p className="pt-2 pb-4 text-center text-xs text-muted-foreground">Wingman explains, never advises. {DATA_AS_OF}.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PanelBody(p: Props) {
  const v = p.view;
  if (v.kind === "home") return (
    <>
      <p className="text-lg leading-relaxed">Hi Sam, I'm Wingman. I'll explain what's going on as you go, so you don't need to know what to ask.</p>
      <button onClick={p.onShowHow} className="block w-full rounded-3xl bg-wing p-5 text-left text-wing-foreground active:scale-[0.98]" aria-label="Show me how investing works">
        <span className="block text-lg font-bold">Show me how investing works</span>
        <span className="block opacity-90">A 20-second guided tour of a real stock.</span>
      </button>
      <button onClick={p.onOpenTip} className="block w-full rounded-3xl border-2 border-wing bg-wing-soft p-5 text-left active:scale-[0.98]" aria-label="Saw a tip online? Check it">
        <span className="block text-lg font-bold">Saw a tip online? Check it</span>
        <span className="block text-muted-foreground">Paste a caption or screenshot.</span>
      </button>
    </>
  );
  if (v.kind === "stock") return <StockCards ticker={v.ticker} amount={p.amount} />;
  if (v.kind === "pause") return <PauseCheck key={v.ticker} {...p} ticker={v.ticker} />;
  if (v.kind === "learned") return <Learned confirmed={v.confirmed} ticker={v.ticker} amount={p.amount} />;
  return <TipChecker {...p} />;
}

export function Happening({ s }: { s: Stock }) {
  const dir = (n: number) => `${n >= 0 ? "Up" : "Down"} ${Math.abs(n)}%`;
  return (
    <Card title="What's happening right now">
      <LineChart data={s.series["1M"]} h={90} />
      <p className="mt-2">{dir(s.change1M)} this month, {dir(s.change1Y).toLowerCase()} this year.</p>
    </Card>
  );
}

export function WhyMoved({ s }: { s: Stock }) {
  return (
    <Card title="Why it moved">
      {s.whyItMoved.length === 0 ? (
        <p>There's no clear reported reason. Prices often move with the wider market.</p>
      ) : (
        <ul className="space-y-3">
          {s.whyItMoved.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-wing" />
              <span>
                {r.text}{" "}
                <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-muted-foreground underline" aria-label={`Source: ${r.sourceName}, ${r.date}`}>
                  {r.sourceName}, {r.date} <ExternalLink size={12} />
                </a>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function MoneyTiles({ s, amount }: { s: Stock; amount: number }) {
  const tiles = [
    ["Normal day", `±${fmtGBP((amount * s.typicalDailyMovePct) / 100)}`],
    ["Bad day", `±${fmtGBP((amount * s.badDayMovePct) / 100)}`],
    ["Bad year could be", `−${fmtGBP((amount * s.badYearPct) / 100)} or more`],
  ];
  return (
    <Card title={`What it means for your ${fmtGBP(amount, 0)}`}>
      <div className="grid grid-cols-3 gap-2">
        {tiles.map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-secondary p-3">
            <div className="text-xs text-muted-foreground">{l}</div>
            <div className="mt-1 text-sm font-bold">{v}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function StockCards({ ticker, amount }: { ticker: Stock["ticker"]; amount: number }) {
  const s = STOCKS[ticker];
  const [openQ, setOpenQ] = useState<number | null>(null);
  return (
    <>
      <Card title="What you're buying" tone="wing">
        Buying a share means owning a small piece of {s.name}. If the company does well, the price can rise. If not, it can fall.
      </Card>
      <Happening s={s} />
      <WhyMoved s={s} />
      <MoneyTiles s={s} amount={amount} />
      <Card title="One company vs many">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-2xl bg-secondary p-3"><b className="block">One share</b>Your money rides on one company. Bigger swings, up and down.</div>
          <div className="rounded-2xl bg-secondary p-3"><b className="block">A fund</b>Spreads money across many companies. One bad company matters less.</div>
        </div>
      </Card>
      <Card title="Questions you might not think to ask">
        <div className="space-y-2">
          {QUESTIONS.map((q, i) => (
            <div key={q.q} className="rounded-2xl border">
              <button aria-expanded={openQ === i} onClick={() => setOpenQ(openQ === i ? null : i)} className="flex min-h-11 w-full items-center justify-between gap-2 px-4 py-2 text-left font-medium">
                {q.q} <ChevronDown size={18} className={`shrink-0 transition-transform ${openQ === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {openQ === i && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-4 text-muted-foreground">
                    <span className="block pb-3">{q.a}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function PauseCheck(p: Props & { ticker: Stock["ticker"] }) {
  const [ans, setAns] = useState<(boolean | null)[]>([null, null, null]);
  const amt = fmtGBP(p.amount, 0);
  return (
    <>
      <h2 className="text-xl font-bold">Quick check before you invest</h2>
      <Card>
        <div className="space-y-4">
          {PAUSE_QUESTIONS.map((q, i) => (
            <div key={q}>
              <p className="font-medium">{q.replace("£50", amt)}</p>
              <div className="mt-2 flex gap-2" role="group" aria-label={q}>
                {[true, false].map((val) => (
                  <button key={String(val)} aria-pressed={ans[i] === val} aria-label={`${val ? "Yes" : "No"}: ${q}`}
                    onClick={() => setAns(ans.map((a, j) => (j === i ? val : a)))}
                    className={`h-11 flex-1 rounded-full border font-semibold ${ans[i] === val ? "border-wing bg-wing text-wing-foreground" : "bg-background"}`}>
                    {val ? "Yes" : "No"}
                  </button>
                ))}
              </div>
              {i === 0 && ans[0] === false && (
                <p className="mt-2 rounded-2xl bg-wing-soft p-3 text-sm">
                  It's usually wise to only invest money you won't need soon.{" "}
                  <a href={LINKS.moneyHelper} target="_blank" rel="noreferrer" className="font-semibold underline">Free guidance from MoneyHelper</a>
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
      <button onClick={() => p.onConfirm(p.ticker)} className="h-14 w-full rounded-full bg-primary text-lg font-bold text-primary-foreground">Confirm {amt} investment</button>
      <button onClick={() => p.onNotNow(p.ticker)} className="h-12 w-full rounded-full font-semibold">Not now</button>
    </>
  );
}

function Learned({ confirmed, ticker }: { confirmed: boolean; ticker: Stock["ticker"]; amount: number }) {
  const s = STOCKS[ticker];
  return (
    <Card title="What you learned today" tone="wing">
      {confirmed ? (
        <>
          <p>Today you learned: what a share is, why prices move after earnings, and why one company is riskier than many.</p>
          <div className="mt-3 text-sm font-semibold">3 concepts learned</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-background">
            <motion.div className="h-full rounded-full bg-wing" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1 }} />
          </div>
        </>
      ) : (
        <p>No problem. Not investing is a valid choice. I've saved {s.name} and what you learned.</p>
      )}
    </Card>
  );
}

function matchTip(text: string): Tip | undefined {
  const t = text.toLowerCase();
  return TIPS.find((tip) => tip.keywords.some((k) => t.includes(k)));
}

function Highlighted({ tip }: { tip: Tip }) {
  let parts: (string | { phrase: string })[] = [tip.text];
  tip.flags.forEach((f) => {
    parts = parts.flatMap((p) => {
      if (typeof p !== "string") return [p];
      const idx = p.indexOf(f.phrase);
      if (idx < 0) return [p];
      return [p.slice(0, idx), { phrase: f.phrase }, p.slice(idx + f.phrase.length)];
    });
  });
  return <>{parts.map((p, i) => (typeof p === "string" ? <span key={i}>{p}</span> : <mark key={i} className="rounded bg-down-soft px-1 text-foreground">{p.phrase}</mark>))}</>;
}

function TipChecker(p: Props) {
  const [text, setText] = useState("");
  const [img, setImg] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Tip | null>(null);
  const [miss, setMiss] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  const run = (tip: Tip | undefined) => {
    setMiss(false);
    if (!tip) { setMiss(true); return; }
    setResult(null);
    setChecking(true);
    setTimeout(() => { setChecking(false); setResult(tip); }, reduce ? 0 : 1200);
  };

  if (checking) return (
    <div className="flex flex-col items-center gap-4 py-16" role="status" aria-live="polite">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-12 w-12 rounded-full border-4 border-wing-soft border-t-wing" />
      <p className="text-lg font-semibold">Checking…</p>
    </div>
  );

  if (result) return <TipResult tip={result} img={img} amount={p.amount} onShowStock={p.onShowStock} onBack={() => { setResult(null); setImg(null); }} />;

  return (
    <>
      <h2 className="text-xl font-bold">Check a tip</h2>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a caption…" aria-label="Paste a caption"
        className="min-h-24 w-full rounded-2xl border bg-secondary p-4 text-base outline-none focus:border-wing" />
      <div className="flex gap-2">
        <button onClick={() => fileRef.current?.click()} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border font-semibold" aria-label="Upload screenshot">
          <Upload size={18} /> Upload screenshot
        </button>
        <button onClick={() => run(matchTip(text))} disabled={!text.trim()} className="h-12 flex-1 rounded-full bg-wing font-semibold text-wing-foreground disabled:opacity-40">Check</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) { setImg(URL.createObjectURL(f)); run(matchTip(text) ?? TIPS[0]); }
      }} />
      {miss && <p className="text-sm text-muted-foreground">I couldn't match that to a stock in this demo. Try one of the examples below.</p>}
      <p className="pt-2 text-sm font-semibold text-muted-foreground">Or try an example</p>
      {TIPS.map((t) => (
        <button key={t.id} onClick={() => { setText(t.text); run(t); }} className="block w-full rounded-2xl border bg-card p-4 text-left active:scale-[0.98]" aria-label={`Check example tip: ${t.text}`}>
          “{t.text}”
        </button>
      ))}
    </>
  );
}

function TipResult({ tip, img, amount, onShowStock, onBack }: { tip: Tip; img: string | null; amount: number; onShowStock: (t: Stock["ticker"]) => void; onBack: () => void }) {
  const labels = Array.from(new Set(tip.flags.map((f) => f.label)));
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <button onClick={onBack} className="text-sm font-semibold text-wing">← Check another tip</button>
      {img && <img src={img} alt="Your uploaded screenshot" className="max-h-48 w-full rounded-2xl object-cover" />}
      {tip.scam ? (
        <>
          <section className="rounded-3xl border border-down/30 bg-down-soft p-5">
            <ShieldAlert className="text-down" size={32} />
            <p className="mt-2 text-xl font-bold text-down">This has common signs of an investment scam. Don't send money.</p>
            <blockquote className="mt-3 rounded-2xl bg-background p-3 text-sm italic">“{tip.text}”</blockquote>
            <h3 className="mt-4 font-bold">Signs we found</h3>
            <ul className="mt-2 space-y-2">
              {tip.scamSigns?.map((s) => <li key={s} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-down" />{s}</li>)}
            </ul>
          </section>
          <a href={LINKS.fcaWarning} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-2 rounded-full bg-primary font-bold text-primary-foreground">Check the FCA Warning List <ExternalLink size={16} /></a>
          <a href={LINKS.scamSmart} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-full border font-semibold">Learn about ScamSmart <ExternalLink size={16} /></a>
        </>
      ) : (
        <>
          <section className="rounded-3xl bg-secondary p-4">
            <p className="text-base leading-relaxed">“<Highlighted tip={tip} />”</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {labels.map((l) => <span key={l} className="rounded-full bg-down-soft px-3 py-1 text-xs font-semibold text-down">{l}</span>)}
            </div>
          </section>
          <Card>
            <dl className="space-y-3">
              {[["Claim", tip.claim], ["Facts we can check", tip.facts], ["Unknown", tip.unknown]].map(([k, v]) => (
                <div key={k} className="grid grid-cols-[96px_1fr] gap-2">
                  <dt className="text-sm font-bold text-muted-foreground">{k}</dt>
                  <dd className="text-base">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
          {tip.ticker && (
            <>
              <Happening s={STOCKS[tip.ticker]} />
              <WhyMoved s={STOCKS[tip.ticker]} />
              <MoneyTiles s={STOCKS[tip.ticker]} amount={amount} />
              <button onClick={() => onShowStock(tip.ticker!)} className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-wing text-lg font-bold text-wing-foreground">
                <Check size={18} /> Show me {STOCKS[tip.ticker].name}
              </button>
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
