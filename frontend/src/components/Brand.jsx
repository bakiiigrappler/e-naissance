import { motion } from "framer-motion";
import { LogoMark } from "./Logo.jsx";

export const GABON = { green: "#009E60", yellow: "#FCD116", blue: "#3A75C4" };

/** Fine bande tricolore vert / jaune / bleu (couleurs du Gabon). */
export function FlagStripe({ className = "" }) {
  return (
    <div className={`flag-stripe ${className}`} aria-hidden="true">
      <span /><span /><span />
    </div>
  );
}

/** Chargeur : le logo au centre, entouré d'un anneau tricolore qui tourne. */
export function LogoLoader({ size = 64, label }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const seg = c / 3;
  const arc = seg - 14;
  const colors = [GABON.green, GABON.yellow, GABON.blue];

  return (
    <div className="logo-loader" role="status" aria-label={label ?? "Chargement"}>
      <div className="logo-loader__box" style={{ width: size, height: size }}>
        <motion.svg className="logo-loader__ring" viewBox="0 0 100 100"
          animate={{ rotate: 360 }} transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}>
          {colors.map((col, i) => (
            <circle key={col} cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${arc} ${c - arc}`} strokeDashoffset={-i * seg} />
          ))}
        </motion.svg>
        <motion.div className="logo-loader__mark" animate={{ scale: [1, 0.9, 1] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}>
          <LogoMark size={Math.round(size * 0.58)} animated={false} />
        </motion.div>
      </div>
      {label && <div className="logo-loader__label">{label}</div>}
    </div>
  );
}
