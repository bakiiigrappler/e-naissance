import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { FlagStripe, LogoLoader } from "./Brand.jsx";

/** Fenêtre de confirmation : en-tête sombre, contenu, pied avec actions. */
export default function ConfirmModal({
  open, icon: Icon, title, subtitle, message, children, confirmLabel = "Confirmer", cancelLabel = "Annuler",
  danger = false, loading = false, loadingLabel = "Traitement en cours…", onConfirm, onCancel,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => cancelRef.current?.focus(), 60);
    const onKey = (e) => { if (e.key === "Escape" && !loading) onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" onClick={() => !loading && onCancel()}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ type: "spring", stiffness: 340, damping: 28 }}>
            <header className={`modal__head ${danger ? "modal__head--danger" : ""}`}>
              {Icon && (
                <motion.span className="modal__icon" initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 15, delay: 0.1 }}>
                  <Icon size={22} />
                </motion.span>
              )}
              <div className="modal__titles">
                <h2 id="modal-title" className="modal__title">{title}</h2>
                {subtitle && <p className="modal__subtitle">{subtitle}</p>}
              </div>
              <button className="modal__close" onClick={onCancel} disabled={loading} aria-label="Fermer"><X size={18} /></button>
              <FlagStripe className="modal__stripe" />
            </header>

            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <motion.div key="loading" className="modal__loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <LogoLoader size={76} label={loadingLabel} />
                </motion.div>
              ) : (
                <motion.div key="content" exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                  <div className="modal__body">
                    {message && <p className="modal__text">{message}</p>}
                    {children}
                  </div>
                  <footer className="modal__foot">
                    <button ref={cancelRef} className="btn btn--outline" onClick={onCancel}>{cancelLabel}</button>
                    <motion.button className={`btn ${danger ? "btn--danger" : "btn--primary"}`} onClick={onConfirm} whileTap={{ scale: 0.97 }}>
                      {Icon && <Icon size={16} />} {confirmLabel}
                    </motion.button>
                  </footer>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
