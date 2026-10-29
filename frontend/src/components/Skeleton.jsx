import { motion } from "framer-motion";
import { LogoLoader } from "./Brand.jsx";

/** Bloc gris qui pulse pendant le chargement (pas de dégradé). */
export function Sk({ w = "100%", h = 14, r = 8, className = "", style }) {
  return <span className={`sk ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} />;
}

export function TableSkeletonRows({ rows = 6, cols = 7 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <tr key={i} className="sk-row" style={{ animationDelay: `${i * 60}ms` }}>
      <td>
        <div className="person">
          <Sk w={34} h={34} r={10} />
          <div style={{ display: "grid", gap: 6 }}><Sk w={130} h={12} /><Sk w={50} h={10} /></div>
        </div>
      </td>
      {Array.from({ length: cols - 2 }).map((__, j) => (
        <td key={j}><Sk w={j === 3 ? 90 : 76} h={j === 3 ? 22 : 12} r={j === 3 ? 999 : 6} /></td>
      ))}
      <td><Sk w={20} h={12} /></td>
    </tr>
  ));
}

function SkPanel({ children, className = "", style }) {
  return <div className={`panel sk-panel ${className}`} style={style}>{children}</div>;
}

export function DashboardSkeleton() {
  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="sk-hero">
        <div style={{ display: "grid", gap: 12, flex: 1 }}>
          <Sk w={160} h={12} className="sk--dark" />
          <Sk w={300} h={28} className="sk--dark" />
          <Sk w="70%" h={14} className="sk--dark" />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Sk w={170} h={40} r={11} className="sk--dark" /><Sk w={170} h={40} r={11} className="sk--dark" />
          </div>
        </div>
        <LogoLoader size={72} label="Chargement du tableau de bord…" />
      </div>

      <div className="stats">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkPanel key={i} className="sk-stat">
            <div style={{ display: "flex", justifyContent: "space-between" }}><Sk w={36} h={36} r={10} /><Sk w={54} h={20} r={999} /></div>
            <Sk w="70%" h={12} style={{ marginTop: 16 }} />
            <Sk w="45%" h={28} style={{ marginTop: 10 }} />
            <Sk w="55%" h={10} style={{ marginTop: 10 }} />
          </SkPanel>
        ))}
      </div>

      <SkPanel style={{ padding: 20 }}>
        <Sk w={180} h={16} /><Sk w={260} h={11} style={{ marginTop: 8 }} />
        <div className="sk-pipe">{Array.from({ length: 7 }).map((_, i) => <Sk key={i} h={74} r={12} />)}</div>
      </SkPanel>

      <div className="grid grid--2-1">
        <SkPanel style={{ padding: 20 }}>
          <Sk w={220} h={16} /><Sk w={160} h={11} style={{ marginTop: 8 }} />
          <div className="sk-bars">
            {[62, 48, 70, 55, 78, 66, 84, 90, 72, 50].map((v, i) => <Sk key={i} h={`${v}%`} r={6} />)}
          </div>
        </SkPanel>
        <SkPanel style={{ padding: 20, display: "grid", justifyItems: "center", gap: 16 }}>
          <Sk w="70%" h={16} style={{ justifySelf: "start" }} />
          <Sk w={180} h={180} r={999} />
          <Sk h={12} /><Sk h={12} />
        </SkPanel>
      </div>

      <SkPanel>
        <div style={{ padding: 20, display: "grid", gap: 8 }}><Sk w={160} h={16} /><Sk w={240} h={11} /></div>
        <table className="table"><tbody><TableSkeletonRows rows={5} /></tbody></table>
      </SkPanel>
    </motion.div>
  );
}
