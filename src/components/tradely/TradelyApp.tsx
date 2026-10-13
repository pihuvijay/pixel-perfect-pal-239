import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Star, MoreHorizontal, Home, BarChart3, Search, PieChart, Inbox, Coins, Activity, Sparkles, Award, Plus, Minus, CheckCircle2 } from "lucide-react";
import {
  STOCKS, TRENDING, TIMEFRAMES, TOUR_STEPS, USER_NAME, DEFAULT_AMOUNT, DATA_AS_OF, gbp, fmtGBP,
  type Stock, type Timeframe,
} from "@/data/demoData";
import { TradelyLogo, WingLogo, StockLogo, Sparkline, LineChart, JargonText, RoundBtn } from "./ui";
import { WingmanPanel, type WingView } from "./Wingman";
import { Tour, type TourStep } from "./Tour";

type Ticker = Stock["ticker"];
type Screen = { name: "welcome" } | { name: "home" } | { name: "stock"; ticker: Ticker } | { name: "order"; ticker: Ticker; amount: number };
type TourState = { steps: TourStep[]; auto: boolean; onDone: () => void } | null;

const TF_LABEL: Record<Timeframe, string> = { "1D": "today", "1W": "past week", "1M": "past month", "3M": "past 3 months", "6M": "past 6 months", YTD: "this year", "1Y": "past year" };

export function TradelyApp() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [screen, setScreen] = useState<Screen>({ name: "welcome" });
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [wing, setWing] = useState<{ open: boolean; expanded: boolean; view: WingView; hasNew: boolean }>({ open: false, expanded: false, view: { kind: "home" }, hasNew: false });
  const [tour, setTour] = useState<TourState>(null);
  const [seen, setSeen] = useState<Set<Ticker>>(new Set());
  const [homeSeen, setHomeSeen] = useState(false);

  const goHome = () => {
    setTour(null);
    setScreen({ name: "home" });
    if (!homeSeen) { setHomeSeen(true); setWing({ open: true, expanded: false, view: { kind: "home" }, hasNew: false }); }
    else setWing((w) => ({ ...w, open: false, expanded: false, view: { kind: "home" } }));
  };

  const openStock = (ticker: Ticker, mode: "normal" | "tour" | "fromTip" = "normal") => {
    setScreen({ name: "stock", ticker });
    setAmount(DEFAULT_AMOUNT);
    const view: WingView = { kind: "stock", ticker };
    const firstTime = !seen.has(ticker);
    setSeen((s) => new Set(s).add(ticker));
    if (mode === "fromTip") {
      setWing({ open: false, expanded: false, view, hasNew: true });
      setTour({ steps: [{ id: "invest", text: "When you're ready, start here. I'll check in before anything happens." }], auto: false, onDone: () => setTour(null) });
    } else if (mode === "tour" || firstTime) {
      setWing({ open: false, expanded: false, view, hasNew: false });
      setTour({ steps: TOUR_STEPS, auto: true, onDone: () => { setTour(null); setWing({ open: true, expanded: false, view, hasNew: false }); } });
    } else {
      setTour(null);
      setWing({ open: false, expanded: false, view, hasNew: true });
    }
  };

  const invest = (ticker: Ticker) => { setTour(null); setWing({ open: true, expanded: false, view: { kind: "pause", ticker }, hasNew: false }); };

  const minimise = useCallback(() => setWing((w) => ({ ...w, open: false, expanded: false })), []);

  return (
    <div className="grid min-h-dvh place-items-center sm:py-8">
      <div ref={frameRef} className="relative h-dvh w-full overflow-hidden bg-background sm:h-[844px] sm:w-[390px] sm:rounded-[52px] sm:border-[10px] sm:border-foreground sm:shadow-soft">
        <div className="no-scrollbar absolute inset-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={screen.name + ("ticker" in screen ? screen.ticker : "")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="min-h-full">
              {screen.name === "welcome" && <Welcome onGo={goHome} />}
              {screen.name === "home" && <HomeScreen onOpen={(t) => openStock(t)} />}
              {screen.name === "stock" && <StockScreen s={STOCKS[screen.ticker]} amount={amount} setAmount={setAmount} onBack={goHome} />}
              {screen.name === "order" && <OrderScreen s={STOCKS[screen.ticker]} amount={screen.amount} onHome={goHome} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {screen.name === "stock" && (
          <button data-tour="invest" onClick={() => invest(screen.ticker)} aria-label={`Invest ${fmtGBP(amount, 0)} in ${STOCKS[screen.ticker].name}`}
            className="absolute inset-x-5 bottom-[100px] z-20 h-14 rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-soft active:scale-[0.98]">
            Invest
          </button>
        )}

        {screen.name !== "welcome" && <BottomNav onHome={goHome} active={screen.name === "home"} />}

        {screen.name !== "welcome" && !wing.open && (
          <WingPill pulse={wing.hasNew} bottom={screen.name === "stock" ? 168 : 100} onClick={() => { setTour(null); setWing((w) => ({ ...w, open: true, hasNew: false })); }} />
        )}

        {tour && <Tour key={tour.steps.map((s) => s.id).join()} steps={tour.steps} auto={tour.auto} frameRef={frameRef} onDone={tour.onDone} />}

        <WingmanPanel
          open={wing.open} expanded={wing.expanded} view={wing.view} amount={amount}
          onMinimise={minimise}
          onToggleExpand={() => setWing((w) => ({ ...w, expanded: !w.expanded }))}
          onShowHow={() => openStock("NVDA", "tour")}
          onOpenTip={() => setWing((w) => ({ ...w, expanded: true, view: { kind: "tip" } }))}
          onShowStock={(t) => openStock(t, "fromTip")}
          onConfirm={(t) => { setScreen({ name: "order", ticker: t, amount }); setWing({ open: true, expanded: false, view: { kind: "learned", ticker: t, confirmed: true }, hasNew: false }); }}
          onNotNow={(t) => setWing((w) => ({ ...w, view: { kind: "learned", ticker: t, confirmed: false } }))}
        />
      </div>
    </div>
  );
}

function WingPill({ pulse, bottom, onClick }: { pulse: boolean; bottom: number; onClick: () => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.button initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={onClick}
      aria-label={pulse ? "Ask your Wingman, new guidance available" : "Ask your Wingman"}
      style={{ bottom }}
      className={`absolute right-4 z-[45] flex h-12 items-center gap-2 rounded-full bg-wing pl-1.5 pr-4 font-bold text-wing-foreground shadow-soft ${pulse && !reduce ? "pulse-wing" : ""}`}>
      <WingLogo size={36} />
      Ask your Wingman
      {pulse && reduce && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-down" />}
    </motion.button>
  );
}

function BottomNav({ onHome, active }: { onHome: () => void; active: boolean }) {
  const items = [
    { l: "Home", I: Home, on: onHome, a: active },
    { l: "Markets", I: BarChart3 }, { l: "Search", I: Search }, { l: "Portfolio", I: PieChart }, { l: "Inbox", I: Inbox },
  ];
  return (
    <nav aria-label="Main" className="absolute inset-x-4 bottom-4 z-20 flex h-[72px] items-center justify-around rounded-full border bg-background shadow-soft">
      {items.map(({ l, I, on, a }) => (
        <button key={l} onClick={on} aria-label={l} className={`flex min-h-11 min-w-11 flex-col items-center gap-0.5 text-[11px] font-semibold ${a ? "text-foreground" : "text-muted-foreground"}`}>
          <I size={22} strokeWidth={a ? 2.4 : 1.8} />{l}
        </button>
      ))}
    </nav>
  );
}

function Welcome({ onGo }: { onGo: () => void }) {
  const rows = [
    { I: Coins, t: "Shares from £1" }, { I: Activity, t: "Live market data" },
    { I: Sparkles, t: "Wingman guidance built in" }, { I: Award, t: "Award-winning support" },
  ];
  return (
    <div className="bg-welcome flex min-h-dvh flex-col px-7 pb-10 pt-16 text-night-foreground sm:min-h-[824px]">
      <TradelyLogo light />
      <h1 className="mt-16 font-serif text-[64px] leading-[0.95]">Investing,<br /><em>explained.</em></h1>
      <ul className="mt-10 space-y-5">
        {rows.map(({ I, t }) => (
          <li key={t} className="flex items-center gap-4 text-lg"><span className="grid h-10 w-10 place-items-center rounded-full bg-night-foreground/10"><I size={20} /></span>{t}</li>
        ))}
      </ul>
      <div className="mt-auto space-y-2 pt-10">
        <button onClick={onGo} className="h-14 w-full rounded-full bg-background text-lg font-bold text-foreground">Get started</button>
        <button onClick={onGo} className="h-12 w-full rounded-full text-lg font-semibold">Log in</button>
      </div>
    </div>
  );
}

function HomeScreen({ onOpen }: { onOpen: (t: Ticker) => void }) {
  return (
    <div className="px-5 pb-48 pt-6">
      <TradelyLogo />
      <p className="mt-8 text-lg text-muted-foreground">Good evening, {USER_NAME}</p>
      <p className="text-5xl font-extrabold tracking-tight">£0.00</p>
      <p className="mt-1 text-muted-foreground">Start your first investment</p>
      <h2 className="mt-10 text-xl font-bold">Trending in tech</h2>
      <ul className="mt-3 divide-y">
        {TRENDING.map((t) => {
          const s = STOCKS[t];
          return (
            <li key={t}>
              <button onClick={() => onOpen(t)} aria-label={`Open ${s.name}`} className="flex w-full items-center gap-3 py-4 text-left active:opacity-70">
                <StockLogo ticker={t} color={s.logoColor} />
                <span className="flex-1"><span className="block font-bold">{s.name}</span><span className="text-sm text-muted-foreground">{t}</span></span>
                <Sparkline data={s.series["1D"]} />
                <span className="w-20 text-right"><span className="block font-bold">{fmtGBP(gbp(s.price))}</span><span className={`text-sm font-semibold ${s.todayPct >= 0 ? "text-up" : "text-down"}`}>{s.todayPct >= 0 ? "+" : ""}{s.todayPct.toFixed(2)}%</span></span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted-foreground">{DATA_AS_OF}</p>
    </div>
  );
}

function StockScreen({ s, amount, setAmount, onBack }: { s: Stock; amount: number; setAmount: (n: number) => void; onBack: () => void }) {
  const [tf, setTf] = useState<Timeframe>("1M");
  const pct = s.periodPct[tf];
  const series = s.series[tf];
  const changeUsd = tf === "1D" ? s.todayChange : series[series.length - 1] - series[0];
  return (
    <div className="pb-56">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/90 px-4 py-3 backdrop-blur">
        <RoundBtn label="Back" onClick={onBack}><ArrowLeft size={20} /></RoundBtn>
        <span className="font-bold">{s.ticker}</span>
        <div className="flex gap-2"><RoundBtn label="Add to watchlist"><Star size={18} /></RoundBtn><RoundBtn label="More options"><MoreHorizontal size={18} /></RoundBtn></div>
      </div>
      <div className="px-5">
        <h1 className="mt-2 text-3xl font-bold">{s.name}</h1>
        <div data-tour="price" className="inline-block">
          <p className="mt-1 text-5xl font-extrabold tracking-tight">{fmtGBP(gbp(s.price))}</p>
          <p className="mt-1 text-base">
            <span className={`font-semibold ${pct >= 0 ? "text-up" : "text-down"}`}>{pct >= 0 ? "↗" : "↘"} {fmtGBP(Math.abs(gbp(changeUsd)))} ({Math.abs(pct).toFixed(2)}%)</span>
            <span className="text-muted-foreground"> {TF_LABEL[tf]}</span>
          </p>
        </div>
        <div data-tour="chart" className="mt-6">
          <LineChart data={series} />
          <div className="mt-3 flex justify-between" role="tablist" aria-label="Chart timeframe">
            {TIMEFRAMES.map((t) => (
              <button key={t} role="tab" aria-selected={t === tf} aria-label={`Show ${TF_LABEL[t]}`} onClick={() => setTf(t)}
                className={`h-11 min-w-11 rounded-full px-2 text-sm font-bold ${t === tf ? "bg-up-soft text-up" : "text-muted-foreground"}`}>{t}</button>
            ))}
          </div>
        </div>
        <h2 className="mt-8 text-xl font-bold">About</h2>
        <p className="mt-2 text-base leading-relaxed text-foreground/85"><JargonText text={s.about} tourFirst /></p>
        <div data-tour="amount" className="mt-8 rounded-3xl border p-4">
          <p className="text-sm font-semibold text-muted-foreground">Amount</p>
          <div className="mt-2 flex items-center justify-between">
            <RoundBtn label="Decrease amount by £10" onClick={() => setAmount(Math.max(10, amount - 10))}><Minus size={18} /></RoundBtn>
            <span className="text-4xl font-extrabold" aria-live="polite">{fmtGBP(amount, 0)}</span>
            <RoundBtn label="Increase amount by £10" onClick={() => setAmount(amount + 10)}><Plus size={18} /></RoundBtn>
          </div>
          <p className="mt-2 text-center text-sm text-muted-foreground">≈ {(amount / gbp(s.price)).toFixed(3)} shares</p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{DATA_AS_OF}</p>
      </div>
    </div>
  );
}

function OrderScreen({ s, amount, onHome }: { s: Stock; amount: number; onHome: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 pt-24 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }}>
        <CheckCircle2 size={88} className="text-up" />
      </motion.div>
      <h1 className="mt-6 text-2xl font-bold">Order placed: {fmtGBP(amount, 0)} in {s.name}</h1>
      <p className="mt-2 text-muted-foreground">Demo only. No real trading took place.</p>
      <button onClick={onHome} className="mt-8 h-14 w-full rounded-full bg-primary text-lg font-bold text-primary-foreground">Back to Home</button>
    </div>
  );
}
