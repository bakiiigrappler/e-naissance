import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);

/** Notifications temporaires en bas à droite (ex. « Déclaration enregistrée »). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((title, text, tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, text, tone }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="toasts">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div key={t.id} className={`toast toast--${t.tone}`} layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 40 }}>
              <span className="toast__icon">{t.tone === "success" ? <CheckCircle2 size={18} /> : <Info size={18} />}</span>
              <div className="toast__content">
                <div className="toast__title">{t.title}</div>
                {t.text && <div className="toast__text">{t.text}</div>}
              </div>
              <button className="toast__close" onClick={() => remove(t.id)} aria-label="Fermer"><X size={15} /></button>
              <motion.span className="toast__bar" initial={{ scaleX: 1 }} animate={{ scaleX: 0 }} transition={{ duration: 4, ease: "linear" }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
