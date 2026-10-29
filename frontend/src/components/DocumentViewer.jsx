import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { X, Download, Printer, ExternalLink, FileText, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { signDocument, verifyUrl } from "../documents/signature.js";
import { FlagStripe, LogoLoader } from "./Brand.jsx";
import "../documents/doc.css";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
// Si le navigateur n'a pas de lecteur PDF intégré, l'aperçu s'affiche en image.
const PDF_VIEWER = typeof navigator === "undefined" || navigator.pdfViewerEnabled !== false;

/** Rend un modèle HTML hors écran, le capture avec html2canvas et produit un PDF A4 avec jsPDF. */
export default function DocumentViewer({ open, onClose, title, subtitle, docs = [], initialKey }) {
  const [active, setActive] = useState(0);
  const [prep, setPrep] = useState(null);      // { key, qr, sig } : modèle signé, prêt à être capturé
  const [cache, setCache] = useState({});      // key -> { url, img }
  const [error, setError] = useState("");
  const stageRef = useRef(null);
  const iframeRef = useRef(null);
  const doc = docs[active];
  const key = doc?.key;
  const ready = doc && cache[doc.key];
  const hasCache = !!ready;

  // Réinitialisation à l'ouverture / libération des PDF à la fermeture
  useEffect(() => {
    if (open) { setActive(Math.max(0, docs.findIndex((d) => d.key === initialKey))); return; }
    setCache((c) => { Object.values(c).forEach((v) => URL.revokeObjectURL(v.url)); return {}; });
    setPrep(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Étape 1 : préparer le QR code de vérification
  useEffect(() => {
    if (!open || !doc || cache[doc.key]) return;
    let cancelled = false;
    setError("");
    (async () => {
      try {
        // Signature numérique des données essentielles, puis QR code pointant vers la page de vérification
        const sig = await signDocument(doc.payload);
        const qr = await QRCode.toDataURL(verifyUrl(sig.token), { margin: 0, width: 300, errorCorrectionLevel: "M", color: { dark: "#0B1F3A", light: "#FFFFFF" } });
        if (!cancelled) setPrep({ key: doc.key, qr, sig });
      } catch {
        if (!cancelled) setError("La signature du document a échoué.");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, key, hasCache]);

  // Étape 2 : capturer le modèle rendu hors écran et produire le PDF
  useEffect(() => {
    if (!prep || !doc || prep.key !== doc.key || cache[doc.key]) return;
    let cancelled = false;
    (async () => {
      try {
        await document.fonts?.ready;
        await wait(120);
        const el = stageRef.current?.querySelector(".d-page");
        if (!el) return;
        await Promise.all([...el.querySelectorAll("img")].map((img) => (img.complete ? 0 : new Promise((r) => { img.onload = img.onerror = r; }))));
        const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false });
        const img = canvas.toDataURL("image/jpeg", 0.92);
        const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
        pdf.setProperties({ title: doc.filename.replace(".pdf", ""), creator: "e-Naissance", subject: doc.label });
        pdf.addImage(img, "JPEG", 0, 0, 210, 297);
        const url = URL.createObjectURL(pdf.output("blob"));
        if (cancelled) { URL.revokeObjectURL(url); return; }
        setCache((c) => ({ ...c, [doc.key]: { url, img, sig: prep.sig } }));
      } catch (e) {
        if (!cancelled) setError("La génération du PDF a échoué. Réessayez.");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prep, key, hasCache]);

  const download = () => {
    const a = document.createElement("a");
    a.href = ready.url; a.download = doc.filename; a.click();
  };
  const print = () => { if (iframeRef.current) iframeRef.current.contentWindow?.print(); else window.open(ready.url, "_blank"); };
  const retry = () => { setError(""); setPrep(null); setCache((c) => { const n = { ...c }; delete n[doc.key]; return n; }); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="dv-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="dv" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <FlagStripe className="dv__stripe" />
            <header className="dv__head">
              <span className="dv__icon"><FileText size={20} /></span>
              <div className="dv__titles">
                <h2>{title}</h2>
                <p>{subtitle}</p>
              </div>
              <div className="dv__actions">
                <a className={`btn btn--outline ${ready?.sig ? "" : "is-disabled"}`} href={ready?.sig ? verifyUrl(ready.sig.token) : undefined} target="_blank" rel="noreferrer"><ShieldCheck size={16} /> <span>Vérifier</span></a>
                <button className="btn btn--outline" onClick={print} disabled={!ready}><Printer size={16} /> <span>Imprimer</span></button>
                <a className={`btn btn--outline ${ready ? "" : "is-disabled"}`} href={ready?.url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> <span>Ouvrir</span></a>
                <button className="btn btn--primary" onClick={download} disabled={!ready}><Download size={16} /> <span>Télécharger le PDF</span></button>
              </div>
              <button className="icon-btn dv__close" onClick={onClose} aria-label="Fermer"><X size={20} /></button>
            </header>

            <div className="dv__body">
              <nav className="dv__list">
                <div className="dv__list-title">Documents disponibles</div>
                {docs.map((d, i) => (
                  <div key={d.key} className="dv__entry">
                  {d.group && d.group !== docs[i - 1]?.group && <div className="dv__group">{d.group}</div>}
                  <button className={`dv__item ${i === active ? "is-active" : ""}`} onClick={() => setActive(i)}>
                    {i === active && <motion.span layoutId="dv-active" className="dv__item-bg" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                    <span className="dv__item-icon"><FileText size={16} /></span>
                    <span className="dv__item-text">
                      <strong>{d.label}</strong>
                      <span>{d.desc}</span>
                    </span>
                    {d.restricted && <span className="dv__lock" title="Délivrance réservée (art. 175)"><Lock size={12} /></span>}
                  </button>
                  </div>
                ))}
                <div className="dv__norme">Format A4 · Registre à souches en trois volets (art. 158) · Contenu conforme au Code civil gabonais (art. 154, 160, 167, 175)</div>
              </nav>

              <section className="dv__preview">
                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div key="err" className="dv__state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p>{error}</p>
                      <button className="btn btn--primary" onClick={retry}><RefreshCw size={16} /> Réessayer</button>
                    </motion.div>
                  ) : !ready ? (
                    <motion.div key={`load-${doc?.key}`} className="dv__state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <LogoLoader size={84} label={`Génération du PDF : ${doc?.label ?? ""}…`} />
                    </motion.div>
                  ) : (
                    <motion.div key={`pdf-${doc.key}`} className={`dv__frame ${PDF_VIEWER ? "" : "dv__frame--img"}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      {PDF_VIEWER && <iframe ref={iframeRef} className="dv__iframe" src={`${ready.url}#toolbar=1&navpanes=0&view=FitH`} title={doc.label} />}
                      <img className="dv__img" src={ready.img} alt={doc.label} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            {/* Rendu hors écran du modèle à capturer (portail : hors des conteneurs animés) */}
            {createPortal(
              <div className="dv__stage" ref={stageRef} aria-hidden="true">
                {doc && prep?.key === doc.key && !cache[doc.key] && doc.render({ qr: prep.qr, sig: prep.sig })}
              </div>,
              document.body,
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
