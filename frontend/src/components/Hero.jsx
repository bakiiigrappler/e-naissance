import { motion } from "framer-motion";
import { CountUp, fadeUp } from "./ui.jsx";
import { LogoMark } from "./Logo.jsx";
import { FlagStripe } from "./Brand.jsx";

/** Bandeau d'accueil commun à tous les tableaux de bord. */
export default function Hero({ title, text, actions, kpis = [], children }) {
  const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <motion.section className="hero" variants={fadeUp}>
      <FlagStripe className="hero__stripe" />
      <div className="hero__watermark" aria-hidden="true"><LogoMark size={260} animated={false} /></div>
      <div className="hero__main">
        <div className="hero__date">{today}</div>
        <h1 className="hero__title">{title}</h1>
        <p className="hero__text">{text}</p>
        {actions && <div className="hero__actions">{actions}</div>}
        {children}
      </div>
      {kpis.length > 0 && (
        <div className="hero__kpis">
          {kpis.map(({ icon: Icon, value, decimals = 0, suffix = "", label }) => (
            <div key={label} className="hero__kpi">
              <Icon size={18} />
              <div>
                <div className="hero__kpi-value">{typeof value === "number" ? <CountUp value={value} decimals={decimals} /> : value}{suffix}</div>
                <div className="hero__kpi-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
