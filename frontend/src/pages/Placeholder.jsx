import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Construction, ArrowLeft } from "lucide-react";
import { LogoLoader } from "../components/Brand.jsx";
import { useLoading } from "../hooks/useLoading.js";

export default function Placeholder({ title }) {
  const loading = useLoading(700);
  return (
    <div className="page">
      <div className="page__head">
        <h1 className="page__title">{title}</h1>
      </div>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="panel empty" exit={{ opacity: 0 }}>
            <LogoLoader size={64} label="Chargement…" />
          </motion.div>
        ) : (
          <motion.div key="content" className="panel empty" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <motion.div className="empty__icon" animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1.5 }}>
              <Construction size={30} />
            </motion.div>
            <h2>Écran en préparation</h2>
            <p>Ce module sera développé dans une prochaine étape du projet.</p>
            <Link to="/" className="btn btn--primary"><ArrowLeft size={16} /> Retour au tableau de bord</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
