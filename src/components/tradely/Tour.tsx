import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type TourStep = { id: string; text: string };
type Rect = { x: number; y: number; w: number; h: number };

export function Tour({ steps, auto, frameRef, onDone }: { steps: TourStep[]; auto: boolean; frameRef: RefObject<HTMLDivElement | null>; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [rect, setRect] = useState<Rect | null>(null);
  const reduce = useReducedMotion();
  const step = steps[i];

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const el = frame.querySelector<HTMLElement>(`[data-tour="${step.id}"]`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    const measure = () => {
      const f = frame.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setRect({ x: r.left - f.left, y: r.top - f.top, w: r.width, h: r.height });
    };
    measure();
    const t = setTimeout(measure, 400);
    return () => clearTimeout(t);
  }, [step.id, frameRef, reduce]);

  useEffect(() => {
    if (!auto || paused) return;
    const t = setTimeout(() => (i < steps.length - 1 ? setI(i + 1) : onDone()), 2500);
    return () => clearTimeout(t);
  }, [i, paused, auto, steps.length, onDone]);

  if (!rect) return null;
  const pad = 8;
  const below = rect.y < 480;
  const tr = reduce ? { duration: 0 } : { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const };

  return (
    <div className={`absolute inset-0 z-40 ${auto ? "" : "pointer-events-none"}`} onClick={() => auto && setPaused((p) => !p)}>
      <motion.div aria-hidden className="absolute rounded-2xl" style={{ boxShadow: "0 0 0 9999px color-mix(in oklab, var(--foreground) 55%, transparent)" }}
        animate={{ left: rect.x - pad, top: rect.y - pad, width: rect.w + pad * 2, height: rect.h + pad * 2 }} transition={tr} />
      <motion.div aria-hidden className="marker-glow absolute h-7 w-7 rounded-full border-2 border-wing-foreground bg-wing"
        animate={{ left: rect.x + Math.min(rect.w - 20, rect.w / 2 + 40), top: rect.y + rect.h / 2 - 14 }} transition={tr} />
      <AnimatePresence mode="wait">
        <motion.div key={step.id} role="status" aria-live="polite" aria-label={`Tour step ${i + 1} of ${steps.length}: ${step.text}`}
          initial={{ opacity: 0, y: below ? -6 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: reduce ? 0 : 0.35 }}
          className="pointer-events-auto absolute left-5 right-5 rounded-2xl bg-wing p-4 text-wing-foreground shadow-soft"
          style={below ? { top: rect.y + rect.h + pad + 14 } : { top: Math.max(60, rect.y - pad - 118) }}>
          <p className="text-base font-semibold leading-snug">{step.text}</p>
          <div className="mt-2 flex items-center justify-between text-sm opacity-90">
            <span>{auto ? `${i + 1}/${steps.length} · ${paused ? "Paused, tap to resume" : "Tap to pause"}` : ""}</span>
            {!auto && <button className="h-9 rounded-full bg-wing-foreground px-4 font-semibold text-wing" onClick={onDone} aria-label="Dismiss hint">Got it</button>}
          </div>
        </motion.div>
      </AnimatePresence>
      {auto && (
        <button onClick={(e) => { e.stopPropagation(); onDone(); }} aria-label="Skip tour"
          className="pointer-events-auto absolute right-4 top-4 h-11 rounded-full bg-background px-4 font-semibold text-foreground shadow-soft">
          Skip tour
        </button>
      )}
    </div>
  );
}
