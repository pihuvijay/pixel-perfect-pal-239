import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { JARGON } from "@/data/demoData";

export function TradelyLogo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`grid h-8 w-8 place-items-center rounded-xl text-base font-extrabold ${light ? "bg-background text-foreground" : "bg-primary text-primary-foreground"}`}>T</div>
      <span className={`text-lg font-bold tracking-tight ${light ? "text-night-foreground" : "text-foreground"}`}>Tradely</span>
    </div>
  );
}

export function WingLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="grid shrink-0 place-items-center rounded-full bg-wing" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6} fill="none" className="stroke-wing-foreground" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17c4-1 8-4 10-9 1-2 3-4 8-5-1 5-3 9-7 12-3 2-7 3-11 2z" />
        <path d="M8 15c2-1 4-3 5-5M11 16c2-1 4-3 5-6" />
      </svg>
    </div>
  );
}

export function StockLogo({ ticker, color, size = 44 }: { ticker: string; color: string; size?: number }) {
  return (
    <div className="grid shrink-0 place-items-center rounded-full font-bold text-primary-foreground" style={{ width: size, height: size, background: color }} aria-hidden>
      {ticker[0]}
    </div>
  );
}

export function Change({ pct, usd, label, gbpFn }: { pct: number; usd?: number; label?: string; gbpFn?: (n: number) => string }) {
  const up = pct >= 0;
  return (
    <span className={`font-semibold ${up ? "text-up" : "text-down"}`}>
      {up ? "↗" : "↘"} {usd !== undefined && gbpFn ? `${gbpFn(Math.abs(usd))} ` : ""}
      {usd !== undefined ? `(${Math.abs(pct).toFixed(2)}%)` : `${Math.abs(pct).toFixed(2)}%`}
      {label ? <span className="font-normal text-muted-foreground"> {label}</span> : null}
    </span>
  );
}

function path(data: number[], w: number, h: number, pad = 2) {
  const min = Math.min(...data), max = Math.max(...data);
  const r = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => pad + (1 - (v - min) / r) * (h - pad * 2);
  return { d: data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" "), y };
}

export function Sparkline({ data, w = 64, h = 28 }: { data: number[]; w?: number; h?: number }) {
  const up = data[data.length - 1] >= data[0];
  const { d } = path(data, w, h);
  return (
    <svg width={w} height={h} aria-hidden>
      <path d={d} fill="none" strokeWidth={1.6} className={up ? "stroke-up" : "stroke-down"} />
    </svg>
  );
}

export function LineChart({ data, h = 180 }: { data: number[]; h?: number }) {
  const w = 350;
  const up = data[data.length - 1] >= data[0];
  const { d, y } = path(data, w, h, 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} aria-label={`Price chart, ${up ? "up" : "down"} over period`} role="img">
      <line x1={0} x2={w} y1={y(data[0])} y2={y(data[0])} strokeDasharray="4 5" strokeWidth={1} className="stroke-muted-foreground/40" />
      <motion.path key={d} d={d} fill="none" strokeWidth={2} strokeLinejoin="round" className={up ? "stroke-up" : "stroke-down"}
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
    </svg>
  );
}

/** Renders text with [[jargon]] terms as tappable dotted-teal underlines. */
export function JargonText({ text, tourFirst = false }: { text: string; tourFirst?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const parts = text.split(/(\[\[[^\]]+\]\])/g);
  let jIdx = -1;
  return (
    <>
      {open !== null && <div className="fixed inset-0 z-30" onClick={() => setOpen(null)} aria-hidden />}
      <span>
        {parts.map((p, i) => {
          const m = p.match(/^\[\[(.+)\]\]$/);
          if (!m) return <span key={i}>{p}</span>;
          jIdx++;
          const word = m[1];
          const entry = JARGON[word.toLowerCase()];
          const isFirst = jIdx === 0 && tourFirst;
          return (
            <span key={i} className="relative inline-block">
              <button type="button" data-tour={isFirst ? "jargon" : undefined} className="jargon font-medium" aria-label={`Explain ${word}`} onClick={() => setOpen(open === i ? null : i)}>
                {word}
              </button>
              <AnimatePresence>
                {open === i && entry && (
                  <motion.span role="tooltip" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute left-1/2 top-full z-40 mt-2 block w-64 -translate-x-1/2 rounded-2xl bg-popover p-3 text-left text-sm leading-snug text-popover-foreground shadow-soft">
                    <span className="block font-semibold capitalize">{word}</span>
                    <span className="mt-1 block">{entry.explanation}</span>
                    <span className="mt-1 block opacity-70">e.g. {entry.example}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          );
        })}
      </span>
    </>
  );
}

export function RoundBtn({ label, children, onClick }: { label: string; children: ReactNode; onClick?: () => void }) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-foreground active:scale-95">
      {children}
    </button>
  );
}
