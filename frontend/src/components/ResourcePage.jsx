import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus, Search, Eye, Pencil, FileDown, ChevronLeft, ChevronRight, X, FileText, Download, Save, SearchX, Lock, Check,
} from "lucide-react";
import Drawer from "./Drawer.jsx";
import DocumentViewer from "./DocumentViewer.jsx";
import EmptyState from "./EmptyState.jsx";
import { TableSkeletonRows } from "./Skeleton.jsx";
import { FlagStripe, LogoLoader } from "./Brand.jsx";
import { useToast } from "./Toast.jsx";
import { useLoading } from "../hooks/useLoading.js";

const PAGE_SIZE = 8;

/* ---------- Petits éléments d'affichage réutilisés par les configurations ---------- */
export const fmtDate = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");
export const initials = (n = "") => n.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export function Badge({ tone = "muted", children }) {
  return <span className={`badge badge--${tone}`}><span className="badge__dot" />{children}</span>;
}

export function Person({ name, sub, tone = "M" }) {
  return (
    <div className="person">
      <span className={`person__avatar person__avatar--${tone}`}>{initials(name)}</span>
      <div><div className="strong">{name}</div>{sub && <div className="muted small">{sub}</div>}</div>
    </div>
  );
}

/* ---------- Formulaire ---------- */
const filled = (v) => String(v ?? "").trim() !== "";

function FormField({ field, value, error, onChange }) {
  const common = { id: field.name, value: value ?? "", onChange: (e) => onChange(field.name, e.target.value) };
  let control;
  if (field.type === "select") {
    control = (
      <select {...common}>
        <option value="">Sélectionner…</option>
        {field.options.map((o) => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    );
  } else if (field.type === "textarea") {
    control = <textarea {...common} rows={3} placeholder={field.placeholder} />;
  } else {
    control = <input {...common} type={field.type ?? "text"} placeholder={field.placeholder} />;
  }
  return (
    <label className={`ffield ${field.full ? "ffield--full" : ""} ${error ? "has-error" : ""} ${filled(value) ? "is-filled" : ""}`} htmlFor={field.name}>
      <span className="ffield__label">
        {field.label}{field.required ? <em>*</em> : <i>facultatif</i>}
      </span>
      {control}
      <AnimatePresence>
        {error && <motion.span className="ffield__error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{error}</motion.span>}
      </AnimatePresence>
      {field.hint && !error && <span className="ffield__hint">{field.hint}</span>}
    </label>
  );
}

function FormBody({ sections, values, errors, onChange }) {
  const refs = useRef([]);
  const status = sections.map((s) => {
    const req = s.fields.filter((f) => f.required);
    return {
      req: req.length,
      done: req.filter((f) => filled(values[f.name])).length,
      filledCount: s.fields.filter((f) => filled(values[f.name])).length,
      error: s.fields.some((f) => errors[f.name]),
    };
  });
  const totalReq = status.reduce((n, s) => n + s.req, 0);
  const totalDone = status.reduce((n, s) => n + s.done, 0);
  const pct = totalReq ? Math.round((totalDone / totalReq) * 100) : 100;

  return (
    <div className="form">
      <div className="fnav">
        <div className="fnav__top">
          <span className="fnav__label">Progression</span>
          <span className="fnav__meta"><strong>{totalDone}</strong> / {totalReq} champs obligatoires</span>
        </div>
        <div className="fnav__bar"><motion.span animate={{ width: `${pct}%` }} transition={{ type: "spring", stiffness: 160, damping: 24 }} className={pct === 100 ? "is-full" : ""} /></div>
        <div className="fnav__steps">
          {sections.map((s, i) => {
            const st = status[i];
            const done = st.req > 0 && st.done === st.req;
            return (
              <button key={s.title} type="button" className={`fnav__step ${done ? "is-done" : ""} ${st.error ? "is-error" : ""}`}
                onClick={() => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                <span className="fnav__num">{done ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                {s.title}
              </button>
            );
          })}
        </div>
      </div>

      {sections.map((s, i) => {
        const st = status[i];
        const done = st.req > 0 && st.done === st.req;
        return (
          <motion.section key={s.title} ref={(el) => (refs.current[i] = el)} className={`fsec ${st.error ? "has-error" : ""}`}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06 }}>
            <header className="fsec__head">
              <span className={`fsec__num ${done ? "is-done" : ""}`}>{done ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
              <div className="fsec__titles">
                <h3>{s.title}</h3>
                {s.note && <p>{s.note}</p>}
              </div>
              <span className="fsec__count"><span className="fsec__mini"><i className={st.filledCount === s.fields.length ? "is-full" : ""} style={{ width: `${(st.filledCount / s.fields.length) * 100}%` }} /></span>{st.filledCount}/{s.fields.length}</span>
            </header>
            <div className="form__grid">
              {s.fields.map((f) => <FormField key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={onChange} />)}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}

/* ---------- Vue détails ---------- */
function DetailSection({ section }) {
  const { title, type = "fields", items = [], empty } = section;
  const isEmpty = !items || items.length === 0;
  return (
    <section className="dsec">
      <h3 className="dsec__title">{title}{type !== "fields" && !isEmpty && <span className="dsec__count">{items.length}</span>}</h3>
      {isEmpty ? (
        <EmptyState compact icon={empty?.icon} title={empty?.title ?? "Aucune information"} text={empty?.text} />
      ) : type === "fields" ? (
        <dl className="dcard">
          {items.map(([label, value]) => (
            <div key={label} className="drow">
              <dt>{label}</dt>
              <dd className={value ? "" : "is-empty"}>{value || "Non renseigné"}</dd>
            </div>
          ))}
        </dl>
      ) : type === "files" ? (
        <ul className="dfiles">
          {items.map((f) => (
            <li key={f.name}>
              <span className="dfiles__icon"><FileText size={17} /></span>
              <div className="dfiles__text"><strong>{f.name}</strong><span>{f.meta}</span></div>
              <button className="act" aria-label="Télécharger"><Download size={15} /></button>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="dtimeline">
          {items.map((e, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <span className={`dtimeline__dot ${i === 0 ? "is-last" : ""}`} />
              <div className="dtimeline__card"><strong>{e.action}</strong><span>{e.user} · {e.date}</span></div>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DetailView({ detail }) {
  const [tab, setTab] = useState(detail.tabs[0].key);
  const current = detail.tabs.find((t) => t.key === tab);
  const facts = (detail.facts ?? detail.tabs[0].sections[0].items ?? []).filter(([, v]) => v).slice(0, 3);
  return (
    <>
      <div className="dhero">
        <div className="dhero__top">
          <span className={`dhero__avatar person__avatar--${detail.tone ?? "M"}`}>{initials(detail.title)}</span>
          <div className="dhero__text">
            <div className="dhero__title">{detail.title}</div>
            <div className="dhero__sub">{detail.subtitle}</div>
          </div>
          <div className="dhero__badge">{detail.badge}</div>
        </div>
        {facts.length > 0 && (
          <div className="dhero__facts">
            {facts.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
          </div>
        )}
        <FlagStripe className="dhero__stripe" />
      </div>

      <div className="dseg" role="tablist">
        {detail.tabs.map((t) => {
          const countable = t.sections.some((s) => s.type && s.type !== "fields");
          const count = t.sections.reduce((n, s) => n + (s.type && s.type !== "fields" ? s.items.length : 0), 0);
          return (
            <button key={t.key} role="tab" aria-selected={tab === t.key} className={`dseg__tab ${tab === t.key ? "is-active" : ""}`} onClick={() => setTab(t.key)}>
              {tab === t.key && <motion.span layoutId="dseg-bg" className="dseg__bg" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="dseg__label">{t.label}</span>
              {countable && <span className={`dseg__count ${count === 0 ? "is-zero" : ""}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {current.sections.map((s) => <DetailSection key={s.title} section={s} />)}
        </motion.div>
      </AnimatePresence>
    </>
  );
}

/* ---------- Page liste complète ---------- */
export default function ResourcePage({ config, initialCreate = false, presetFilter, readOnly = false, documents, rowFilter }) {
  const {
    title, subtitle, icon, entity, columns, rows: initialRows = [], searchKeys = [], searchPlaceholder,
    filters, form, detail, canCreate = true, canEdit = () => true, createLabel, empty, newRow, kpis,
  } = config;
  const allowCreate = canCreate && !readOnly && !!form;

  const loading = useLoading(850);
  const toast = useToast();
  const [rows, setRows] = useState(() => (rowFilter ? initialRows.filter(rowFilter) : initialRows));
  const [q, setQ] = useState("");
  const [filtre, setFiltre] = useState(presetFilter ?? filters?.[0]?.key);
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(initialCreate && allowCreate ? { mode: "create" } : null);
  const [values, setValues] = useState(() => (initialCreate && form?.defaults ? { ...form.defaults } : {}));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [viewer, setViewer] = useState(null);
  const viewerDocs = useMemo(() => (viewer && documents ? documents(viewer) : []), [viewer, documents]);
  const docCount = (r) => (documents ? documents(r).length : 0);

  const filtered = useMemo(() => {
    const f = filters?.find((x) => x.key === filtre);
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => (!f?.test || f.test(r)) &&
      (!needle || searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle))));
  }, [rows, q, filtre, filters, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const pageRows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const openCreate = () => { setValues(form?.defaults ? { ...form.defaults } : {}); setErrors({}); setDrawer({ mode: "create" }); };
  const openEdit = (row) => { setValues({ ...row }); setErrors({}); setDrawer({ mode: "edit", row }); };
  const openView = (row) => setDrawer({ mode: "view", row });
  const close = () => { if (!saving) setDrawer(null); };

  const onChange = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const save = () => {
    const errs = {};
    form.sections.forEach((s) => s.fields.forEach((f) => { if (f.required && !String(values[f.name] ?? "").trim()) errs[f.name] = "Champ obligatoire"; }));
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("Formulaire incomplet", `${Object.keys(errs).length} champ(s) obligatoire(s) à compléter.`, "info");
      return;
    }
    setSaving(true);
    setTimeout(() => {
      if (drawer.mode === "create") {
        const created = newRow ? newRow(values, rows) : { ...values, id: `${Date.now()}` };
        setRows((r) => [created, ...r]);
        setQ(""); setFiltre(filters?.[0]?.key); setPage(1);
        toast(`${entity} créé(e)`, "L'enregistrement a été ajouté en tête de liste.");
      } else {
        setRows((r) => r.map((x) => (x.id === drawer.row.id ? { ...x, ...values } : x)));
        toast(`${entity} modifié(e)`, "Les modifications ont été enregistrées et tracées dans le journal.");
      }
      setSaving(false);
      setDrawer(null);
    }, 900);
  };

  const viewed = drawer?.mode === "view" ? detail(drawer.row) : null;
  const editable = drawer?.row ? canEdit(drawer.row) : true;
  const hasData = rows.length > 0;

  return (
    <div className="page">
      <div className="page__head">
        <div>
          <h1 className="page__title">{title}</h1>
          <p className="page__subtitle">{subtitle}</p>
        </div>
        {allowCreate && (
          <motion.button className="btn btn--primary" onClick={openCreate} whileTap={{ scale: 0.97 }}>
            <Plus size={17} /> {createLabel}
          </motion.button>
        )}
      </div>

      {kpis && (
        <div className="mini-kpis">
          {kpis(rows).map((k, i) => (
            <motion.div key={k.label} className={`mini-kpi mini-kpi--${k.tone ?? "navy"}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <span className="mini-kpi__value">{k.value}</span><span className="mini-kpi__label">{k.label}</span>
            </motion.div>
          ))}
        </div>
      )}

      <section className="panel">
        <div className="toolbar">
          <div className="toolbar__search">
            <Search size={17} />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={searchPlaceholder ?? "Rechercher…"} disabled={!hasData} />
            {q && <button className="toolbar__clear" onClick={() => setQ("")} aria-label="Effacer"><X size={15} /></button>}
          </div>
          {filters && (
            <div className="chips">
              {filters.map((f) => {
                const count = rows.filter((r) => !f.test || f.test(r)).length;
                return (
                  <button key={f.key} className={`chip ${filtre === f.key ? "is-active" : ""}`} onClick={() => { setFiltre(f.key); setPage(1); }}>
                    {filtre === f.key && <motion.span layoutId={`chip-${title}`} className="chip__bg" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    <span className="chip__text">{f.label} <span className="chip__count">{count}</span></span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {loading ? (
          <div className="table-wrap table-wrap--flush"><table className="table"><tbody><TableSkeletonRows rows={6} cols={Math.max(columns.length + 1, 4)} /></tbody></table></div>
        ) : !hasData ? (
          <EmptyState icon={empty?.icon} title={empty?.title ?? "Aucune donnée"} text={empty?.text}
            action={allowCreate ? <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> {createLabel}</button> : null} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={SearchX} title="Aucun résultat" text={q ? `Aucun enregistrement ne correspond à « ${q} ».` : "Aucun enregistrement dans cette catégorie."}
            action={<button className="btn btn--outline" onClick={() => { setQ(""); setFiltre(filters?.[0]?.key); }}>Réinitialiser les filtres</button>} />
        ) : (
          <>
            <div className="table-wrap table-wrap--flush">
              <table className="table">
                <thead>
                  <tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th className="table__actions-h">Actions</th></tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false} mode="popLayout">
                    {pageRows.map((r, i) => (
                      <motion.tr key={r.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} exit={{ opacity: 0 }}
                        onDoubleClick={() => openView(r)}>
                        {columns.map((c) => <td key={c.key} className={c.className}>{c.render ? c.render(r) : r[c.key] || <span className="muted">—</span>}</td>)}
                        <td className="table__actions">
                          {docCount(r) > 0 && <button className="act act--pdf" onClick={() => setViewer(r)} title="Documents PDF"><FileDown size={16} /></button>}
                          <button className="act" onClick={() => openView(r)} title="Voir les détails"><Eye size={16} /></button>
                          {form && !readOnly && (canEdit(r)
                            ? <button className="act" onClick={() => openEdit(r)} title="Modifier"><Pencil size={16} /></button>
                            : <span className="act is-locked" title="Non modifiable (acte signé : passer par une rectification)"><Lock size={15} /></span>)}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <div className="pager">
              <span className="muted">{(current - 1) * PAGE_SIZE + 1}–{Math.min(current * PAGE_SIZE, filtered.length)} sur {filtered.length}</span>
              <div className="pager__btns">
                <button className="act" disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Page précédente"><ChevronLeft size={16} /></button>
                {Array.from({ length: pages }).map((_, i) => (
                  <button key={i} className={`pager__num ${current === i + 1 ? "is-active" : ""}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
                ))}
                <button className="act" disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Page suivante"><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Création / modification */}
      <Drawer open={drawer?.mode === "create" || drawer?.mode === "edit"} onClose={close} busy={saving}
        icon={drawer?.mode === "edit" ? Pencil : Plus}
        title={drawer?.mode === "edit" ? `Modifier : ${entity.toLowerCase()}` : createLabel}
        subtitle={drawer?.mode === "edit" ? `Référence ${drawer.row.id} · toute modification est tracée dans le journal d'audit` : "Les champs marqués * sont obligatoires"}
        footer={
          <>
            <button className="btn btn--outline" onClick={close} disabled={saving}>Annuler</button>
            <motion.button className="btn btn--primary drawer__save" onClick={save} disabled={saving} whileTap={{ scale: 0.97 }}>
              {saving ? <><LogoLoader size={22} /> Enregistrement…</> : <><Save size={16} /> {drawer?.mode === "edit" ? "Enregistrer les modifications" : "Enregistrer"}</>}
            </motion.button>
          </>
        }>
        {form && <FormBody sections={form.sections} values={values} errors={errors} onChange={onChange} />}
      </Drawer>

      {/* Détails */}
      <Drawer open={drawer?.mode === "view"} onClose={close} icon={Eye} title={`Détails : ${entity.toLowerCase()}`} subtitle={drawer?.row?.id}
        footer={
          <>
            <button className="btn btn--outline" onClick={close}>Fermer</button>
            {drawer?.row && docCount(drawer.row) > 0 && <button className="btn btn--outline btn--pdf" onClick={() => setViewer(drawer.row)}><FileDown size={16} /> Documents PDF</button>}
            {form && !readOnly && (editable
              ? <button className="btn btn--primary" onClick={() => openEdit(drawer.row)}><Pencil size={16} /> Modifier</button>
              : <span className="drawer__locked"><Lock size={14} /> Acte signé : modification par rectification uniquement</span>)}
            {(!form || readOnly) && <span className="drawer__locked"><Check size={14} /> Consultation seule</span>}
          </>
        }>
        {viewed && <DetailView key={drawer.row.id} detail={viewed} />}
      </Drawer>

      <DocumentViewer open={!!viewer} onClose={() => setViewer(null)} docs={viewerDocs}
        title={viewer ? `Documents : ${entity.toLowerCase()} ${viewer.id}` : ""}
        subtitle="Aperçu PDF au format A4 · généré à partir du registre numérique" />
    </div>
  );
}
