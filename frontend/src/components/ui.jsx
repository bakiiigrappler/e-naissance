import { useEffect, useRef } from "react";
import { animate, motion, useInView } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { STATUTS } from "../data/mock.js";

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};
export const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/** Nombre qui défile de 0 à sa valeur quand il devient visible. */
export function CountUp({ value, duration = 1.1, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration, ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = v.toLocaleString("fr-FR", {
          minimumFractionDigits: decimals, maximumFractionDigits: decimals,
        });
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, decimals]);
  return <span ref={ref}>0</span>;
}

export function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <motion.section className={`panel ${className}`} variants={fadeUp}>
      {(title || action) && (
        <div className="panel__head">
          <div>
            <h2 className="panel__title">{title}</h2>
            {subtitle && <p className="panel__subtitle">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="panel__body">{children}</div>
    </motion.section>
  );
}

function Sparkline({ data }) {
  const w = 96, h = 32;
  const min = Math.min(...data), max = Math.max(...data);
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - 3 - ((v - min) / (max - min || 1)) * (h - 6),
  ]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <motion.path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} />
      <motion.circle cx={last[0]} cy={last[1]} r="3" fill="currentColor"
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2 }} />
    </svg>
  );
}

export function StatCard({ label, value, trend, note, spark, alert, invert, icon: Icon }) {
  const good = invert ? trend < 0 : trend > 0;
  return (
    <motion.div className={`stat ${alert ? "stat--alert" : ""}`} variants={fadeUp}
      whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <div className="stat__top">
        <span className="stat__icon">{Icon && <Icon size={18} />}</span>
        <span className={`trend ${good ? "trend--good" : "trend--bad"}`}>
          {trend > 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {trend > 0 ? "+" : ""}{trend} %
        </span>
      </div>
      <div className="stat__label">{label}</div>
      <div className="stat__row">
        <div className="stat__value"><CountUp value={value} /></div>
        {spark && <Sparkline data={spark} />}
      </div>
      <div className="stat__note">{note}</div>
    </motion.div>
  );
}

export function StatusBadge({ statut }) {
  const s = STATUTS[statut] ?? { label: statut, tone: "muted" };
  return <span className={`badge badge--${s.tone}`}><span className="badge__dot" />{s.label}</span>;
}
