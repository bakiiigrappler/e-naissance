import { motion } from "framer-motion";
import { Inbox } from "lucide-react";

/** Affichage quand il n'y a aucune donnée. */
export default function EmptyState({ icon: Icon = Inbox, title, text, action, compact = false }) {
  return (
    <motion.div className={`empty-state ${compact ? "empty-state--compact" : ""}`}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="empty-state__art" aria-hidden="true">
        <span className="empty-state__ring" />
        <motion.span className="empty-state__icon" animate={{ y: [0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={compact ? 20 : 26} />
        </motion.span>
        {!compact && <span className="empty-state__dots"><i /><i /><i /></span>}
      </div>
      <div className="empty-state__title">{title}</div>
      {text && <p className="empty-state__text">{text}</p>}
      {action}
    </motion.div>
  );
}
