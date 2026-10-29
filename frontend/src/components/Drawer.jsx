import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FlagStripe } from "./Brand.jsx";

/** Panneau latéral (offcanvas) qui glisse depuis la droite. */
export default function Drawer({ open, onClose, icon: Icon, title, subtitle, headerExtra, children, footer, width = 600, busy = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !busy) onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, busy, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-backdrop" onClick={() => !busy && onClose()}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="drawer" style={{ width }} role="dialog" aria-modal="true" aria-label={title}
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}>
            <FlagStripe className="drawer__stripe" />
            <header className="drawer__head">
              {Icon && <span className="drawer__icon"><Icon size={20} /></span>}
              <div className="drawer__titles">
                <h2 className="drawer__title">{title}</h2>
                {subtitle && <p className="drawer__subtitle">{subtitle}</p>}
              </div>
              <button className="icon-btn drawer__close" onClick={onClose} disabled={busy} aria-label="Fermer"><X size={20} /></button>
            </header>
            {headerExtra}
            <motion.div className="drawer__body" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12, duration: 0.3 }}>
              {children}
            </motion.div>
            {footer && <footer className="drawer__foot">{footer}</footer>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
