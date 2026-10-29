// Modèles A4 des documents d'état civil, mis en page sur le modèle des actes gabonais :
// moitié gauche réservée (mentions, cachets, certification, sécurité), moitié droite = formulaire
// administratif à lignes pointillées, renvois numérotés (1) à (7), « signature et timbre ».
// Contenu conforme au Code civil gabonais (loi n°15/72) : art. 154, 156-157, 160-161, 164, 167-168, 172, 175.
import { CENTRE } from "./data.js";
import { dateEnLettres, dateLongue, fmt } from "./format.js";
import SceauRepublique from "./Sceau.jsx";

const dots = (iso) => (iso ? iso.split("-").reverse().join(".") : "");
/** Date en toutes lettres sur deux lignes (« dix-neuf octobre » / « deux mil vingt-six »), comme sur les registres. */
const enLettres = (iso) => {
  if (!iso) return ["", ""];
  const t = dateEnLettres(iso);
  const i = t.lastIndexOf(" deux mil");
  return i > 0 ? [t.slice(0, i), t.slice(i + 1)] : [t, ""];
};
const heure = (hhmm) => (hhmm ? hhmm.split(":") : ["", ""]);
const sexeTxt = (s) => (s === "F" ? "Féminin" : "Masculin");
/** Nom utilisé pour la signature manuscrite (sans titre « Dr »). */
const paraphe = (nom = "") => nom.replace(/^(Dr|Pr)\.?\s+/i, "").split(" ")[0];

/* ---------- Éléments de formulaire ---------- */
function L({ label, n, v, cont }) {
  return (
    <>
      <div className="f-line">
        {(label || n) && <span className="f-label">{label}{n && <sup>({n})</sup>}</span>}
        <span className="f-dots"><span className="f-val">{v}</span></span>
      </div>
      {cont !== undefined && <div className="f-line f-line--cont"><span className="f-dots"><span className="f-val">{cont}</span></span></div>}
    </>
  );
}

const Pair = ({ a, b }) => <div className="f-pair">{a}{b}</div>;

function Entete({ lines, sub, title, subtitle }) {
  return (
    <header className="f-head">
      <div className="f-rep">République Gabonaise</div>
      <div className="f-devise">Union – Travail – Justice</div>
      {lines.map((l) => <div key={l} className="f-admin">{l}</div>)}
      {sub && <div className="f-volet">{sub}</div>}
      <h1 className="f-title">{title}</h1>
      {subtitle && <div className="f-subtitle">{subtitle}</div>}
    </header>
  );
}

const ENTETE_CENTRE = ["PROVINCE DE L'ESTUAIRE", "COMMUNE DE LIBREVILLE", "CENTRE D'ÉTAT CIVIL DE LIBREVILLE", "1ER ARRONDISSEMENT"];

/** Sceau de la République (cachet à l'encre). */
function Sceau({ top = "RÉPUBLIQUE GABONAISE", bottom = "ÉTAT CIVIL · LIBREVILLE", size = 92 }) {
  return <span className="f-sceau-rep"><SceauRepublique size={size} top={top} bottom={bottom} /></span>;
}

/** Bloc de sécurité : QR code + code signé (ECDSA P-256) + empreinte SHA-256. */
function Securite({ qr, sig }) {
  return (
    <div className="f-secu">
      <div className="f-secu__title">Authentification du document</div>
      <div className="f-secu__row">
        {qr && <img src={qr} alt="" width="124" height="124" />}
        <div className="f-secu__txt">
          <div className="f-secu__label">Code signé</div>
          <div className="f-secu__code">{sig?.code}</div>
          <div className="f-secu__label">Empreinte SHA-256</div>
          <div className="f-secu__hash">{sig?.hash?.slice(0, 32)}<br />{sig?.hash?.slice(32)}</div>
        </div>
      </div>
      <div className="f-secu__sig"><b>Signature ECDSA P-256 :</b> {sig?.signature?.slice(0, 58)}…</div>
      <div className="f-secu__hint">Scannez le QR code ou saisissez le code signé sur la page « Vérifier un document » d'e-Naissance.</div>
    </div>
  );
}

function Certification({ titre = "Copie certifiée conforme à l'original", date, ville = CENTRE.ville, qualite = "L'Officier d'État Civil", nom = CENTRE.officier }) {
  return (
    <div className="f-certif">
      <div className="f-certif__box">
        <div className="f-certif__t">{titre}</div>
        <div>{ville}, le {fmt(date)}</div>
        <div className="f-certif__who">{qualite}</div>
        <div className="f-certif__row"><Sceau size={84} /><div className="f-certif__sign"><span className="f-script">{paraphe(nom)}</span><b>{nom}</b></div></div>
      </div>
    </div>
  );
}

function Mentions({ items, titre = "Mentions marginales" }) {
  return (
    <div className="f-mentions">
      <div className="f-mentions__title">{titre}</div>
      {items.length === 0
        ? <div className="f-mentions__none">Néant</div>
        : items.map((m, i) => <div key={i} className="f-mentions__item"><b>{m.date}</b> — {m.texte}</div>)}
    </div>
  );
}

function Page({ left, right, watermark = "SPÉCIMEN", note }) {
  return (
    <div className="d-page f-page">
      <div className="d-watermark">{watermark}</div>
      <div className="f-cols">
        <aside className="f-left">{left}</aside>
        <main className="f-right">{right}</main>
      </div>
      <footer className="f-foot">
        {note && <div className="f-foot__note">{note}</div>}
        <div className="f-foot__demo">Document de démonstration généré par e-Naissance avec des données fictives : sans valeur légale.</div>
      </footer>
    </div>
  );
}

function SignOfficier({ qualite = "L'Officier d'État Civil,", nom = CENTRE.officier, sceau = {} }) {
  return (
    <div className="f-sign">
      <div className="f-sign__q">{qualite}</div>
      <div className="f-sign__zone"><Sceau {...sceau} /><span className="f-script">{paraphe(nom)}</span></div>
      <div className="f-sign__paren">(signature et timbre)</div>
      <div className="f-sign__nom">{nom}</div>
    </div>
  );
}

const NOTE_RECTIF = "Note très importante : aucune rectification matérielle n'est valable si elle n'est contresignée par l'Officier d'État Civil (art. 189 du Code civil).";
const RENVOIS = "(1) En toutes lettres · (2) Masculin ou féminin · (3) Nom et prénoms de l'enfant · (4) Nom et prénoms du père · (5) Mention de reconnaissance · (6) Rayer la mention inutile · (7) Signatures";

function ParentBlock({ p, f }) {
  return (
    <>
      <Pair a={<L label="Date de Naissance" v={p ? dots(p.dateNaissance) : ""} />} b={<L label="Lieu" v={p?.lieuNaissance} />} />
      <L label={f ? "Domiciliée à" : "Domicilié à"} v={p?.domicile} />
      <L label="Profession" v={p?.profession} />
      <Pair a={<L label="Nationalité" v={p?.nationalite} />} b={<L label="Coutume" v={p?.coutume} />} />
      <L label="C.N.I. N°" v={p?.cni} />
    </>
  );
}

/* ---------- 1. Acte de naissance : volets du registre à souches et copie intégrale ----------
   Volet n°1 : souche, conservée au registre du centre · Volet n°2 : exemplaire d'archives (dépôt légal, art. 158)
   Volet n°3 : remis à la mère / au déclarant · Copie intégrale : délivrée d'après la souche (art. 160). */
export const VOLETS = {
  v1: { num: 1, label: "SOUCHE", dest: "Conservé au registre du centre d'état civil : ne pas détacher" },
  v2: { num: 2, label: "ARCHIVES", dest: "Exemplaire destiné au dépôt légal (greffe du tribunal / Ministère de l'Intérieur)" },
  v3: { num: 3, label: "MÈRE", dest: "Volet remis à la mère ou au déclarant" },
};

function ActeNaissance({ acte, deliv, qr, sig, mode }) {
  const e = acte.enfant, p = acte.pere, m = acte.mere;
  const [dd1, dd2] = enLettres(acte.dateDeclaration);
  const [dn1, dn2] = enLettres(e.dateNaissance);
  const [h, mi] = heure(e.heure);
  const volet = VOLETS[mode];
  const sub = volet ? `VOLET NUMÉRO ${volet.num} (${volet.label})` : "COPIE INTÉGRALE D'APRÈS LA SOUCHE";
  return (
    <Page note={NOTE_RECTIF}
      left={<>
        <Mentions items={acte.mentions} />
        {mode === "ci" && <Certification titre="Copie intégrale certifiée conforme à la souche" date={deliv.date} />}
        {volet && (
          <div className="f-mentions f-volet-box">
            <div className="f-mentions__title">Volet n°{volet.num} · {volet.label}</div>
            <div className="f-volet-box__dest">{volet.dest}</div>
            <L label="Registre" v={acte.registre} />
            <Pair a={<L label="Acte N°" v={acte.numero} />} b={<L label="Année" v={acte.annee} />} />
            {mode === "v1" && <L label="Feuillet" v={`${Math.ceil(Number(acte.numero) / 3) || "—"}`} />}
            {mode === "v3" && <div className="f-volet-box__note">Ce volet est l'original remis à la famille. Les copies et extraits sont délivrés par le centre d'après la souche.</div>}
          </div>
        )}
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={sub} title="ACTE DE NAISSANCE" />
        <Pair a={<L label="N°" v={acte.numero} />} b={<L label="Du" v={dots(acte.dateDeclaration)} />} />
        <L label="Le" n="1" v={dd1} cont={dd2} />
        <L label="Suivant bulletin de naissance N°" v={acte.bulletin.numero} />
        <L label="du" v={acte.bulletin.etablissement} />
        <div className="f-text">Qui a déclaré la naissance survenue :</div>
        <L label="à" v={`${e.lieu}, ${e.commune}`} />
        <L label="Le" n="1" v={dn1} cont={dn2} />
        <Pair a={<L label="à" v={h} />} b={<L label="heures" v={mi} />} />
        <L label="D'un enfant de sexe :" n="2" v={sexeTxt(e.sexe)} />
        <L label="Nommé :" n="3" v={e.nom} cont={e.prenoms} />
        <L label="Né de :" n="4" v={p?.nom ?? ""} />
        <ParentBlock p={p} />
        <L n="5" v={p ? "qui l'a formellement reconnu" : ""} />
        <L label="Et de :" v={m?.nom} />
        <ParentBlock p={m} f />
        <div className="f-legit"><span><span className="f-strike">Sa légitime épouse</span><sup>(6)</sup></span><span>Les parents<sup>(7)</sup></span></div>
        <div className="f-declarant">Le déclarant<sup>(7)</sup> : <b>{acte.declarant.nom}</b>, {acte.declarant.qualite?.toLowerCase()} de l'enfant, {acte.declarant.piece}, qui, lecture faite, a signé avec Nous.</div>
        <div className="f-sign-row">
          <div className="f-sign-decl">
            <div className="f-sign__q">Le déclarant,</div>
            <div className="f-sign-decl__zone"><span className="f-script">{acte.declarant.nom.split(" ").slice(-1)[0]}</span></div>
            <div className="f-sign__nom">{acte.declarant.nom}</div>
          </div>
          <SignOfficier />
        </div>
        <div className="f-renvois">{RENVOIS}</div>
      </>} />
  );
}

export const CopieIntegrale = (props) => <ActeNaissance {...props} mode="ci" />;
export const Volet = ({ volet, ...props }) => <ActeNaissance {...props} mode={volet} />;

/* ---------- 2 et 3. Extrait d'acte de naissance ---------- */
export function Extrait({ acte, deliv, qr, sig, filiation }) {
  const e = acte.enfant, p = acte.pere, m = acte.mere;
  const [dn1, dn2] = enLettres(e.dateNaissance);
  const [h, mi] = heure(e.heure);
  return (
    <Page note={filiation
      ? "Extrait avec filiation (art. 175 du Code civil) : délivré dans les mêmes conditions que la copie intégrale."
      : "Extrait sans filiation (art. 175 du Code civil) : délivré à tout requérant, sans mention de la source des énonciations."}
      left={<>
        <Mentions items={acte.mentions} />
        <Certification titre="Extrait certifié conforme au registre" date={deliv.date} />
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={filiation ? "EXTRAIT AVEC FILIATION" : "EXTRAIT SANS FILIATION"} title="EXTRAIT D'ACTE DE NAISSANCE" />
        <Pair a={<L label="Acte N°" v={acte.numero} />} b={<L label="Année" v={acte.annee} />} />
        <L label="Le" n="1" v={dn1} cont={dn2} />
        <Pair a={<L label="à" v={h} />} b={<L label="heures" v={mi} />} />
        <L label="Est né(e) à" v={`${e.lieu}, ${e.commune}`} />
        <L label="Un enfant de sexe :" n="2" v={sexeTxt(e.sexe)} />
        <L label="Nommé :" n="3" v={e.nom} cont={e.prenoms} />
        {filiation && (<>
          <div className="f-section">Filiation</div>
          <L label="Fils / fille de :" n="4" v={p?.nom ?? ""} />
          <L label="Profession" v={p?.profession} />
          <L label="Domicilié à" v={p?.domicile} />
          <L label="Et de :" v={m?.nom} />
          <L label="Profession" v={m?.profession} />
          <L label="Domiciliée à" v={m?.domicile} />
        </>)}
        <SignOfficier />
        <div className="f-renvois">(1) En toutes lettres · (2) Masculin ou féminin · (3) Nom et prénoms{filiation ? " · (4) Nom et prénoms du père" : ""}</div>
      </>} />
  );
}

/* ---------- 4. Certificat (bulletin) de naissance : établissement de santé ---------- */
// Le bulletin alimente l'acte (« Suivant bulletin de naissance N° … ») : il porte donc l'enfant et la filiation.
export function CertificatNaissance({ c, qr, sig }) {
  const brouillon = c.statut === "Brouillon";
  const [dn1, dn2] = enLettres(c.dateNaissance);
  const [h, mi] = heure(c.heure);
  const pere = c.pere ? { dateNaissance: c.pereDateNaissance, lieuNaissance: c.pereLieuNaissance, domicile: c.mereDomicile, profession: c.pereProfession, nationalite: c.pereNationalite, coutume: c.pereCoutume, cni: c.pereCni } : null;
  const mere = { dateNaissance: c.mereDateNaissance, lieuNaissance: c.mereLieuNaissance, domicile: c.mereDomicile, profession: c.mereProfession, nationalite: c.mereNationalite, coutume: c.mereCoutume, cni: c.mereCni };
  return (
    <Page watermark={brouillon ? "BROUILLON" : "SPÉCIMEN"}
      note="Bulletin délivré gratuitement et sans délai (loi n°004/2021). À présenter au centre d'état civil dans un délai de deux semaines (commune) ou d'un mois (autres lieux)."
      left={<>
        <div className="f-mentions">
          <div className="f-mentions__title">Cadre réservé au centre d'état civil</div>
          <L label="Reçu le" v={c.transmis ? dots(c.transmis) : ""} />
          <L label="Enregistré sous" v={c.declaration || ""} />
          <L label="Acte N°" v="" />
          <L label="Agent" v="" />
        </div>
        <div className="f-mentions">
          <div className="f-mentions__title">Renseignements médicaux</div>
          <L label="Naissance" v={c.nes ?? "Unique"} />
          <L label="Accouchement" v={c.accouchement} />
          <Pair a={<L label="Poids" v={c.poids && `${c.poids} kg`} />} b={<L label="Taille" v={c.taille && `${c.taille} cm`} />} />
          <L label="État" v="Vivant" />
        </div>
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={["MINISTÈRE DE LA SANTÉ", c.etablissement.toUpperCase(), "SERVICE DE MATERNITÉ"]} sub={`BULLETIN DE NAISSANCE N° ${c.id}`} title="CERTIFICAT DE NAISSANCE" />
        <L label="Je soussigné(e)" v={c.praticien} />
        <Pair a={<L label="Qualité" v={c.qualitePraticien} />} b={<L label="Service" v="Maternité" />} />
        <div className="f-text">Certifie que la naissance suivante est survenue dans notre établissement :</div>
        <L label="à" v={`${c.etablissement}, ${c.commune ?? "Libreville"}`} />
        <L label="Le" n="1" v={dn1} cont={dn2} />
        <Pair a={<L label="à" v={h} />} b={<L label="heures" v={mi} />} />
        <L label="D'un enfant de sexe :" n="2" v={sexeTxt(c.sexe)} />
        <L label="Nom provisoire :" n="3" v={c.enfant} />
        <L label="Prénom(s) proposé(s)" v={c.prenomsProposes} />
        <L label={c.sexe === "F" ? "Fille de :" : "Fils de :"} n="4" v={c.pere || "Non déclaré"} />
        <ParentBlock p={pere} />
        <L label="Et de :" v={c.mere} />
        <ParentBlock p={mere} f />
        <SignOfficier qualite={`Le ${c.qualitePraticien ?? "praticien"},`} nom={c.praticien} sceau={{ top: "MINISTÈRE DE LA SANTÉ", bottom: "MATERNITÉ · LIBREVILLE" }} />
        <div className="f-renvois">(1) En toutes lettres · (2) Masculin ou féminin · (3) Le nom définitif est déclaré au centre d'état civil · (4) Nom et prénoms du père, s'il est connu</div>
      </>} />
  );
}

/* ---------- 5. Récépissé de déclaration de naissance ---------- */
export function Recepisse({ d, qr, sig }) {
  const [dn1, dn2] = enLettres(d.dateNaissance);
  return (
    <Page note="Ce récépissé atteste du dépôt de la déclaration. Il ne vaut pas acte de naissance."
      left={<>
        <div className="f-mentions">
          <div className="f-mentions__title">Suivi du dossier</div>
          <L label="Délai légal" v={d.delai === "dans" ? "Respecté" : "Dépassé"} />
          <L label="Orientation" v={d.delai === "dans" ? "Procédure normale" : "Procédure judiciaire"} />
        </div>
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={`DOSSIER N° ${d.id}`} title="RÉCÉPISSÉ DE DÉCLARATION" subtitle="de naissance" />
        <L label="Déposé le" v={dots(d.declaration)} />
        <L label="Enfant :" n="3" v={d.nom} cont={d.prenoms} />
        <L label="De sexe :" n="2" v={sexeTxt(d.sexe)} />
        <L label="Né(e) le" n="1" v={dn1} cont={dn2} />
        <L label="à" v={`${d.lieu}, ${d.commune}`} />
        <div className="f-section">Déclarant</div>
        <L label="Nom et prénoms" v={d.declarantNom} />
        <L label="Qualité" v={d.declarantQualite} />
        <L label="Pièce d'identité" v={d.declarantPiece} />
        <SignOfficier qualite="L'Agent d'État Civil," nom={d.agent} />
        <div className="f-renvois">(1) En toutes lettres · (2) Masculin ou féminin · (3) Nom et prénoms</div>
      </>} />
  );
}

/* ---------- 6. Transcription d'un jugement supplétif ---------- */
export function Transcription({ j, qr, sig }) {
  const [dt1, dt2] = enLettres(j.transcription.date);
  return (
    <Page note="Transcription effectuée d'office en application des articles 164 et 172 du Code civil."
      left={<>
        <Mentions items={[{ date: fmt(j.transcription.date), texte: `Transcription du jugement ${j.id} : acte ${j.transcription.acte}` }]} />
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={`ACTE ÉTABLI ${j.transcription.acte}`} title="TRANSCRIPTION" subtitle="de jugement supplétif d'acte de naissance" />
        <L label="Jugement N°" v={j.id} />
        <L label="Rendu le" v={dots(j.dateJugement)} />
        <L label="Par le" v={j.juridiction} />
        <L label="Reçu le" v={dots(j.dateReception)} />
        <L label="À la requête de" v={j.requerant} />
        <div className="f-section">Énonciations retenues</div>
        <L label="Enfant :" n="3" v={j.enfant} />
        <L label="Date de naissance" v={dateLongue(j.dateNaissanceRetenue)} />
        <L label="Lieu de naissance" v={j.lieuRetenu} />
        <L label="Filiation" v={j.filiation} />
        <div className="f-dispositif"><b>Dispositif :</b> « {j.dispositif} »</div>
        <L label="Transcrit le" n="1" v={dt1} cont={dt2} />
        <SignOfficier />
        <div className="f-renvois">(1) En toutes lettres · (3) Nom et prénoms</div>
      </>} />
  );
}

/* =====================================================================
   AUTRES DOCUMENTS DE LA PLATEFORME
   ===================================================================== */
const joursEntre = (a, b) => (a && b ? Math.round((new Date(b) - new Date(a)) / 86400000) : "");
const Coche = ({ on }) => <span className={`f-check ${on ? "is-on" : ""}`}>{on ? "✕" : ""}</span>;

/* ---------- 7. Déclaration de naissance (formulaire signé par le déclarant) ---------- */
export function DeclarationNaissance({ d, qr, sig }) {
  const [dn1, dn2] = enLettres(d.dateNaissance);
  const [h, mi] = heure(d.heure);
  const jours = joursEntre(d.dateNaissance, d.declaration);
  const pieces = (d.pieces ?? []).map((p) => p.name);
  const has = (s) => pieces.some((p) => p.toLowerCase().includes(s));
  const pere = d.pereNom ? { dateNaissance: "", lieuNaissance: "", domicile: d.mereDomicile, profession: d.pereProfession, nationalite: d.pereNationalite, coutume: "", cni: d.pereCni } : null;
  const mere = { dateNaissance: d.mereDateNaissance, lieuNaissance: "", domicile: d.mereDomicile, profession: d.mereProfession, nationalite: d.mereNationalite, coutume: "", cni: d.mereCni };
  return (
    <Page note="Toute fausse déclaration expose son auteur aux sanctions prévues par la loi. Délai légal : deux semaines (commune) ou un mois (autres lieux), loi n°004/2021."
      left={<>
        <div className="f-mentions">
          <div className="f-mentions__title">Cadre réservé à l'administration</div>
          <L label="Reçue le" v={dots(d.declaration)} />
          <L label="Dossier N°" v={d.id} />
          <L label="Délai écoulé" v={jours !== "" ? `${jours} jours` : ""} />
          <L label="Délai légal" v={d.delai === "dans" ? "Respecté" : "Dépassé"} />
          <L label="Agent" v={d.agent} />
        </div>
        <div className="f-mentions">
          <div className="f-mentions__title">Pièces fournies</div>
          <div className="f-checks">
            <div><Coche on={has("certificat")} /> Certificat de naissance (établissement de santé)</div>
            <div><Coche on={has("mère")} /> Pièce d'identité de la mère</div>
            <div><Coche on={has("déclarant")} /> Pièce d'identité du déclarant</div>
            <div><Coche on={!!d.pereNom} /> Pièce d'identité du père</div>
            <div><Coche on={false} /> Acte de mariage des parents</div>
          </div>
        </div>
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={`FORMULAIRE N° ${d.id}`} title="DÉCLARATION DE NAISSANCE" />
        <div className="f-section">Enfant</div>
        <L label="Nom" n="3" v={d.nom} />
        <L label="Prénom(s)" v={d.prenoms} />
        <Pair a={<L label="Sexe" n="2" v={sexeTxt(d.sexe)} />} b={<L label="Nationalité" v={d.nationalite} />} />
        <L label="Né(e) le" n="1" v={dn1} cont={dn2} />
        <Pair a={<L label="à" v={h} />} b={<L label="heures" v={mi} />} />
        <L label="Lieu" v={`${d.lieu}, ${d.commune} (${d.province})`} />
        <div className="f-section">Père</div>
        <L label="Nom et prénoms" n="4" v={d.pereNom || "Non déclaré"} />
        <Pair a={<L label="Profession" v={pere?.profession} />} b={<L label="C.N.I. N°" v={pere?.cni} />} />
        <div className="f-section">Mère</div>
        <L label="Nom et prénoms" v={d.mereNom} />
        <Pair a={<L label="Née le" v={dots(mere.dateNaissance)} />} b={<L label="C.N.I. N°" v={mere.cni} />} />
        <Pair a={<L label="Profession" v={mere.profession} />} b={<L label="Nationalité" v={mere.nationalite} />} />
        <L label="Domicile" v={mere.domicile} />
        <div className="f-section">Déclarant</div>
        <L label="Nom et prénoms" v={d.declarantNom} />
        <Pair a={<L label="Qualité" v={d.declarantQualite} />} b={<L label="Pièce" v={d.declarantPiece} />} />
        <div className="f-declarant">Je soussigné(e), <b>{d.declarantNom}</b>, certifie l'exactitude des renseignements ci-dessus.</div>
        <div className="f-sign-row">
          <div className="f-sign-decl">
            <div className="f-sign__q">Le déclarant,</div>
            <div className="f-sign-decl__zone"><span className="f-script">{paraphe(d.declarantNom.split(" ").slice(-1)[0])}</span></div>
            <div className="f-sign__nom">{d.declarantNom}</div>
          </div>
          <SignOfficier qualite="L'Agent d'État Civil," nom={d.agent} />
        </div>
        <div className="f-renvois">(1) En toutes lettres · (2) Masculin ou féminin · (3) Nom de l'enfant · (4) Si le père reconnaît l'enfant</div>
      </>} />
  );
}

/* ---------- 8. Attestation de non-inscription (déclaration hors délai, art. 172) ---------- */
export function AttestationNonInscription({ d, deliv, qr, sig }) {
  const jours = joursEntre(d.dateNaissance, d.declaration);
  return (
    <Page note="Attestation à joindre à la requête en jugement supplétif d'acte de naissance (art. 172 du Code civil)."
      left={<>
        <div className="f-mentions">
          <div className="f-mentions__title">Recherche effectuée</div>
          <L label="Registre" v={`REG-LBV1-N-${d.dateNaissance.slice(0, 4)}`} />
          <L label="Période" v={`${dots(d.dateNaissance)} → ${dots(d.declaration)}`} />
          <L label="Résultat" v="Aucune inscription" />
          <L label="Délai écoulé" v={`${jours} jours`} />
        </div>
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={`DOSSIER N° ${d.id}`} title="ATTESTATION DE NON-INSCRIPTION" subtitle="au registre des naissances" />
        <div className="f-prose">
          Nous, <b>{CENTRE.officier}</b>, Officier de l'état civil du Centre d'état civil de Libreville (1er arrondissement), attestons qu'après
          recherche dans les registres des naissances de l'année <b>{d.dateNaissance.slice(0, 4)}</b>, <b>aucun acte de naissance</b> n'a été dressé au nom de :
        </div>
        <L label="Nom et prénoms" v={`${d.nom} ${d.prenoms}`} />
        <Pair a={<L label="Sexe" v={sexeTxt(d.sexe)} />} b={<L label="Né(e) le" v={dots(d.dateNaissance)} />} />
        <L label="à" v={`${d.lieu}, ${d.commune}`} />
        <L label="Mère" v={d.mereNom} />
        <L label="Père" v={d.pereNom || "Non déclaré"} />
        <div className="f-prose">
          La déclaration présentée le <b>{dateLongue(d.declaration)}</b> par <b>{d.declarantNom}</b> ({d.declarantQualite?.toLowerCase()}) intervient
          <b> après l'expiration du délai légal</b>. Conformément à l'article 172 du Code civil, la naissance ne peut être inscrite qu'en
          transcrivant un <b>jugement supplétif</b> du tribunal civil du lieu de naissance.
        </div>
        <div className="f-prose">En foi de quoi, la présente attestation est délivrée pour servir et valoir ce que de droit.</div>
        <SignOfficier />
      </>} />
  );
}

/* ---------- 9. Fiche de réception d'un jugement supplétif ---------- */
export function FicheJugement({ j, qr, sig }) {
  const etapes = ["JUGEMENT_SUPPLETIF_EN_ATTENTE", "JUGEMENT_RENDU", "JUGEMENT_DEFINITIF", "TRANSCRIPTION_EFFECTUEE"];
  const labels = ["Requête déposée", "Jugement rendu", "Jugement définitif", "Transcrit sur le registre"];
  const idx = etapes.indexOf(j.statut);
  return (
    <Page note="Le dispositif du jugement devenu définitif est transcrit d'office sur les registres de l'année en cours (art. 164)."
      left={<>
        <div className="f-mentions">
          <div className="f-mentions__title">Suivi de la procédure</div>
          <div className="f-checks">
            {labels.map((l, i) => <div key={l}><Coche on={i <= idx} /> {l}</div>)}
          </div>
        </div>
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={`JUGEMENT N° ${j.id}`} title="FICHE DE RÉCEPTION" subtitle="de jugement supplétif d'acte de naissance" />
        <L label="Juridiction" v={j.juridiction} />
        <Pair a={<L label="Rendu le" v={j.dateJugement ? dots(j.dateJugement) : "En attente"} />} b={<L label="Reçu le" v={dots(j.dateReception)} />} />
        <L label="Requérant" v={j.requerant} />
        <div className="f-section">Énonciations retenues</div>
        <L label="Enfant" n="3" v={j.enfant} />
        <Pair a={<L label="Né(e) le" v={j.dateNaissanceRetenue ? dots(j.dateNaissanceRetenue) : ""} />} b={<L label="à" v={j.lieuRetenu} />} />
        <L label="Filiation" v={j.filiation} />
        <div className="f-dispositif"><b>Dispositif :</b> « {j.dispositif} »</div>
        <L label="Suite à donner" v={idx >= 3 ? "Transcrit" : idx === 2 ? "À transcrire d'office" : "Attendre le caractère définitif"} />
        <SignOfficier />
      </>} />
  );
}

/* ---------- 10. Procès-verbal d'ouverture / de clôture de registre (art. 158) ---------- */
export function PVRegistre({ r, qr, sig }) {
  const cloture = r.statut === "Clôturé";
  const feuillets = Math.max(100, Math.ceil(Number(r.nbActes) / 3) + 50);
  return (
    <Page note="Registres tenus en triple exemplaire, cotés et paraphés par le Président du tribunal (art. 158 du Code civil)."
      left={<>
        <div className="f-mentions">
          <div className="f-mentions__title">Caractéristiques</div>
          <L label="Registre" v={r.id} />
          <L label="Type" v={r.type} />
          <Pair a={<L label="Année" v={r.annee} />} b={<L label="Feuillets" v={feuillets} />} />
          <L label="Actes inscrits" v={Number(r.nbActes).toLocaleString("fr-FR")} />
          <L label="Exemplaires" v="3 (centre, greffe, ministère)" />
        </div>
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={`REGISTRE ${r.id}`} title={cloture ? "PROCÈS-VERBAL DE CLÔTURE" : "PROCÈS-VERBAL D'OUVERTURE"} subtitle="du registre des naissances" />
        <div className="f-prose">
          {cloture
            ? <>Le présent registre des naissances de l'année <b>{r.annee}</b>, du centre <b>{r.centre}</b>, est <b>clos et arrêté</b> le
                trente et un décembre {r.annee}, après l'acte n° <b>{r.nbActes}</b>. Il comprend <b>{Number(r.nbActes).toLocaleString("fr-FR")} actes</b> inscrits
                sur {feuillets} feuillets cotés et paraphés. Les feuillets non utilisés ont été bâtonnés.</>
            : <>Le présent registre des naissances, destiné au centre <b>{r.centre}</b> pour l'année <b>{r.annee}</b>, comprenant <b>{feuillets} feuillets</b>
                numérotés de 1 à {feuillets}, a été <b>coté et paraphé</b> par le Président du tribunal de première instance de Libreville et
                ouvert le <b>{dateLongue(r.ouverture)}</b>.</>}
        </div>
        <L label="Ouvert le" v={dots(r.ouverture)} />
        {cloture && <L label="Clos le" v={`31.12.${r.annee}`} />}
        <L label="Premier acte" v="N° 1" />
        <L label="Dernier acte inscrit" v={`N° ${r.nbActes}`} />
        <div className="f-sign-row">
          <SignOfficier qualite="Le Président du tribunal," nom="NDONG Évariste" sceau={{ top: "RÉPUBLIQUE GABONAISE", bottom: "TRIBUNAL · LIBREVILLE" }} />
          <SignOfficier />
        </div>
      </>} />
  );
}

/* ---------- 11. Avis de mention marginale (art. 164, 168) ---------- */
export function AvisMention({ m, qr, sig }) {
  return (
    <Page note="La mention est portée en marge de l'acte de naissance et reproduite sur toute copie intégrale délivrée ultérieurement (art. 160, 168)."
      left={<><Mentions items={[{ date: dots(m.dateDecision), texte: m.contenu }]} titre="Mention à porter en marge" /><Securite qr={qr} sig={sig} /></>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={`MENTION N° ${m.id}`} title="AVIS DE MENTION MARGINALE" />
        <L label="Acte concerné N°" v={m.acte} />
        <L label="Nature de la mention" v={m.type} />
        <Pair a={<L label="Décision du" v={dots(m.dateDecision)} />} b={<L label="Référence" v={m.reference} />} />
        <L label="Autorité" v={m.autorite} />
        <div className="f-dispositif"><b>Contenu :</b> « {m.contenu} »</div>
        <SignOfficier />
      </>} />
  );
}

/* ---------- 12. Procès-verbal de rectification (art. 189) ---------- */
export function PVRectification({ r, qr, sig }) {
  return (
    <Page note="Les actes de l'état civil ne peuvent être rectifiés qu'en vertu d'une décision de l'autorité compétente (art. 189 du Code civil)."
      left={<><Mentions items={[{ date: "—", texte: `Rectification « ${r.champ} » : ${r.ancienneValeur} → ${r.nouvelleValeur}` }]} titre="Mention à porter en marge" /><Securite qr={qr} sig={sig} /></>}
      right={<>
        <Entete lines={ENTETE_CENTRE} sub={`RECTIFICATION N° ${r.id}`} title="PROCÈS-VERBAL DE RECTIFICATION" />
        <L label="Acte concerné N°" v={r.acte} />
        <L label="Information rectifiée" v={r.champ} />
        <L label="Ancienne valeur" v={r.ancienneValeur} />
        <L label="Nouvelle valeur" v={r.nouvelleValeur} />
        <L label="Décision" v={r.decision} />
        <L label="Autorité" v={r.autorite} />
        <div className="f-dispositif"><b>Motif :</b> « {r.motif} »</div>
        <SignOfficier />
      </>} />
  );
}

/* ---------- 13. Fiche d'habilitation d'un utilisateur ---------- */
export function FicheHabilitation({ u, perms, qr, sig }) {
  return (
    <Page note="Les accès sont nominatifs. Toute opération est enregistrée dans le journal d'audit (cahier des charges, sections 21 à 23)."
      left={<>
        <div className="f-mentions">
          <div className="f-mentions__title">Permissions du rôle</div>
          <div className="f-checks">{perms.map(([p, v]) => <div key={p}><Coche on={!v.startsWith("Non")} /> {p}</div>)}</div>
        </div>
        <Securite qr={qr} sig={sig} />
      </>}
      right={<>
        <Entete lines={["PLATEFORME E-NAISSANCE", "ADMINISTRATION DES ACCÈS"]} sub={`COMPTE ${u.id}`} title="FICHE D'HABILITATION" />
        <L label="Nom et prénoms" v={u.nom} />
        <Pair a={<L label="Identifiant" v={u.identifiant} />} b={<L label="Statut" v={u.statut} />} />
        <L label="Rôle" v={u.role} />
        <L label="Centre de rattachement" v={u.centre} />
        <L label="E-mail" v={u.email} />
        <L label="Téléphone" v={u.telephone} />
        <div className="f-declarant">L'agent reconnaît avoir pris connaissance des règles de confidentialité des données de l'état civil et s'engage à ne pas divulguer son mot de passe.</div>
        <div className="f-sign-row">
          <div className="f-sign-decl">
            <div className="f-sign__q">L'intéressé(e),</div>
            <div className="f-sign-decl__zone"><span className="f-script">{paraphe(u.nom.split(" ").slice(-1)[0])}</span></div>
            <div className="f-sign__nom">{u.nom}</div>
          </div>
          <SignOfficier qualite="L'Administrateur," nom="MOUNGUENGUI Alice" />
        </div>
      </>} />
  );
}
