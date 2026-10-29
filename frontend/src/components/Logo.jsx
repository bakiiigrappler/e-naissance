import { motion } from "framer-motion";

/**
 * Logo e-Naissance : un acte officiel (document) validé par un sceau.
 * Couleurs unies : bleu foncé, noir, blanc.
 */
export function LogoMark({ size = 40, animated = true }) {
  const seal = animated
    ? { initial: { scale: 0, rotate: -90 }, animate: { scale: 1, rotate: 0 },
        transition: { type: "spring", stiffness: 260, damping: 16, delay: 0.25 } }
    : {};
  const check = animated
    ? { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.4, delay: 0.55 } }
    : {};

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#12325E" />
      <path d="M12 8h11l7 7v16.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 10 31.5v-21A2.5 2.5 0 0 1 12 8z" fill="#FFFFFF" />
      <path d="M23 8v5.5a1.5 1.5 0 0 0 1.5 1.5H30z" fill="#C7D3E6" />
      <rect x="13.5" y="17" width="10" height="2" rx="1" fill="#12325E" />
      <rect x="13.5" y="21.5" width="7" height="2" rx="1" fill="#12325E" />
      <motion.g style={{ transformOrigin: "28px 29px" }} {...seal}>
        <circle cx="28" cy="29" r="6.5" fill="#0A0A0A" stroke="#FFFFFF" strokeWidth="2" />
        <motion.path d="M25.2 29.2l1.9 1.9 3.8-3.9" stroke="#FFFFFF" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" {...check} />
      </motion.g>
    </svg>
  );
}

export default function Logo({ collapsed = false }) {
  return (
    <div className="logo">
      <LogoMark />
      {!collapsed && (
        <motion.div className="logo__text" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
          <div className="logo__name">e-Naissance</div>
          <div className="logo__tag">État civil · Gabon</div>
        </motion.div>
      )}
    </div>
  );
}
