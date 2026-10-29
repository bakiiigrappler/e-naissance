import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, X, Lock, FileDown, SearchX, ScrollText, ClipboardList, Stethoscope, Gavel, Library, Users, PenLine, BookMarked } from "lucide-react";
import DocumentViewer from "../components/DocumentViewer.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { Badge } from "../components/ResourcePage.jsx";
import { useAuth, canAccess } from "../auth.jsx";
import { rowScope, docScope } from "../data/scope.js";
import { DOCUMENTS } from "../documents/registry.jsx";
import { declarations, actes, certificats, jugements, registres, utilisateurs, rectifications, mentions } from "../data/resources.jsx";

// Sources de documents (une par écran de l'application)
const SOURCES = [
  { key: "declarations", path: "/naissances", label: "Déclarations", icon: ClipboardList, rows: declarations.rows, docs: DOCUMENTS.declarations, title: (r) => `${r.nom} ${r.prenoms}` },
  { key: "actes", path: "/actes", label: "Actes de naissance", icon: ScrollText, rows: actes.rows, docs: DOCUMENTS.actes, title: (r) => r.enfant },
  { key: "certificats", path: "/certificats", label: "Certificats", icon: Stethoscope, rows: certificats.rows, docs: DOCUMENTS.certificats, title: (r) => `${r.enfant} (mère : ${r.mere})` },
  { key: "jugements", path: "/jugements", label: "Jugements", icon: Gavel, rows: jugements.rows, docs: DOCUMENTS.jugements, title: (r) => r.enfant },
  { key: "rectifications", path: "/rectifications", label: "Rectifications", icon: PenLine, rows: rectifications.rows, docs: DOCUMENTS.rectifications, title: (r) => r.acte },
  { key: "mentions", path: "/mentions", label: "Mentions", icon: BookMarked, rows: mentions.rows, docs: DOCUMENTS.mentions, title: (r) => r.acte },
  { key: "registres", path: "/registres", label: "Registres", icon: Library, rows: registres.rows, docs: DOCUMENTS.registres, title: (r) => `${r.centre} · ${r.annee}` },
  { key: "utilisateurs", path: "/utilisateurs", label: "Habilitations", icon: Users, rows: utilisateurs.rows, docs: DOCUMENTS.utilisateurs, title: (r) => r.nom },
];

/** Catalogue de tous les documents de la plateforme accessibles au rôle connecté. */
export default function Documents() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("tous");
  const [viewer, setViewer] = useState(null);
  const [limit, setLimit] = useState(30);

  const sources = useMemo(() => SOURCES.filter((s) => canAccess(s.path, user.role)), [user.role]);
  const allowed = docScope(user);

  const entries = useMemo(() => sources.flatMap((s) => s.rows.filter(rowScope(s.key, user)).flatMap((row) =>
    s.docs(row).filter(allowed).map((doc) => ({ s, row, doc, title: s.title(row) })))), [sources]); // eslint-disable-line react-hooks/exhaustive-deps

  const types = useMemo(() => {
    const m = new Map();
    entries.forEach((e) => m.set(e.doc.label.replace(/ : .*/, ""), (m.get(e.doc.label.replace(/ : .*/, "")) ?? 0) + 1));
    return [...m.entries()];
  }, [entries]);

  const needle = q.trim().toLowerCase();
  const list = entries.filter((e) => (cat === "tous" || e.s.key === cat) &&
    (!needle || `${e.doc.label} ${e.title} ${e.row.id}`.toLowerCase().includes(needle)));

  const open = (e) => setViewer({ docs: e.s.docs(e.row).filter(allowed), initialKey: e.doc.key, title: `${e.s.label} : ${e.row.id}` });

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1 className="page__title">Documents</h1>
          <p className="page__subtitle">Tous les documents générés par la plateforme : déclarations, actes, volets du registre, copies, extraits, certificats, jugements…</p>
        </div>
      </div>

      <div className="doc-catalog">
        {types.map(([t, n], i) => (
          <motion.div key={t} className="doc-type" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <span className="doc-type__icon"><FileText size={16} /></span>
            <span className="doc-type__label">{t}</span>
            <span className="doc-type__count">{n}</span>
          </motion.div>
        ))}
      </div>

      <section className="panel">
        <div className="toolbar">
          <div className="toolbar__search">
            <Search size={17} />
            <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(30); }} placeholder="Rechercher un document, un nom, un n° de dossier…" />
            {q && <button className="toolbar__clear" onClick={() => setQ("")} aria-label="Effacer"><X size={15} /></button>}
          </div>
          <div className="chips">
            {[{ key: "tous", label: "Tous" }, ...sources].map((s) => {
              const count = s.key === "tous" ? entries.length : entries.filter((e) => e.s.key === s.key).length;
              return (
                <button key={s.key} className={`chip ${cat === s.key ? "is-active" : ""}`} onClick={() => { setCat(s.key); setLimit(30); }}>
                  {cat === s.key && <motion.span layoutId="chip-docs" className="chip__bg" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="chip__text">{s.label} <span className="chip__count">{count}</span></span>
                </button>
              );
            })}
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState icon={SearchX} title={entries.length === 0 ? "Aucun document" : "Aucun résultat"}
            text={cat !== "tous" && entries.filter((e) => e.s.key === cat).length === 0
              ? "Aucun enregistrement dans cette catégorie pour le moment : les documents apparaîtront dès qu'un enregistrement sera créé."
              : `Aucun document ne correspond à « ${q} ».`} />
        ) : (
          <div className="table-wrap table-wrap--flush">
            <table className="table">
              <thead><tr><th>Document</th><th>Concerne</th><th>Référence</th><th>Catégorie</th><th>Accès</th><th className="table__actions-h">Action</th></tr></thead>
              <tbody>
                {list.slice(0, limit).map((e) => {
                  const Icon = e.s.icon;
                  return (
                    <tr key={e.doc.key}>
                      <td>
                        <div className="person">
                          <span className="doc-row__icon"><FileText size={16} /></span>
                          <div><div className="strong">{e.doc.label}</div><div className="muted small">{e.doc.group ?? e.doc.desc}</div></div>
                        </div>
                      </td>
                      <td>{e.title}</td>
                      <td className="mono">{e.row.id}</td>
                      <td><span className="doc-cat"><Icon size={14} /> {e.s.label}</span></td>
                      <td>{e.doc.restricted ? <Badge tone="yellow"><Lock size={11} /> Réservé</Badge> : <Badge tone="green">Libre</Badge>}</td>
                      <td className="table__actions"><button className="btn btn--outline btn--sm" onClick={() => open(e)}><FileDown size={15} /> Ouvrir</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {list.length > limit && (
              <div className="doc-more">
                <span className="muted small">{list.length - limit} documents supplémentaires</span>
                <button className="btn btn--outline btn--sm" onClick={() => setLimit((l) => l + 30)}>Afficher plus</button>
              </div>
            )}
          </div>
        )}
      </section>

      <DocumentViewer open={!!viewer} onClose={() => setViewer(null)} docs={viewer?.docs ?? []} initialKey={viewer?.initialKey}
        title={viewer?.title ?? ""} subtitle="Aperçu PDF au format A4 · généré à partir du registre numérique" />
    </div>
  );
}
