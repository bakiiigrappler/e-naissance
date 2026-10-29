// Documents disponibles pour chaque type d'enregistrement.
// « payload » = données essentielles signées numériquement et encodées dans le QR code.
import { CENTRE, acteFromActe, acteFromDeclaration, delivrance } from "./data.js";
import {
  CopieIntegrale, Volet, Extrait, CertificatNaissance, Recepisse, Transcription,
  DeclarationNaissance, AttestationNonInscription, FicheJugement, PVRegistre, AvisMention, PVRectification, FicheHabilitation,
} from "./templates.jsx";

const acteDocs = (acte, prefix) => {
  const deliv = delivrance();
  const base = { n: acte.numero, a: acte.annee, c: CENTRE.code, nom: `${acte.enfant.nom} ${acte.enfant.prenoms}`, dn: acte.enfant.dateNaissance, e: deliv.date };
  const volet = (v, num, label, desc) => ({
    key: `${prefix}-${v}`, label: `Volet n°${num} : ${label}`, desc, restricted: true, group: "Registre à souches",
    filename: `Acte_${acte.numero}_volet_${num}_${label.toLowerCase()}.pdf`, payload: { t: v.toUpperCase(), ...base },
    render: (p) => <Volet volet={v} acte={acte} deliv={deliv} {...p} />,
  });
  return [
    volet("v1", 1, "Souche", "Conservé au registre du centre (ne se détache pas)"),
    volet("v2", 2, "Archives", "Exemplaire du dépôt légal (art. 158)"),
    volet("v3", 3, "Mère", "Original remis à la mère ou au déclarant"),
    { key: `${prefix}-ci`, group: "Copies et extraits", label: "Copie intégrale", desc: "Délivrée d'après la souche, avec mentions (art. 160)", restricted: true,
      filename: `Acte_${acte.numero}_copie_integrale.pdf`, payload: { t: "CI", ...base },
      render: (p) => <CopieIntegrale acte={acte} deliv={deliv} {...p} /> },
    { key: `${prefix}-ef`, group: "Copies et extraits", label: "Extrait avec filiation", desc: "Avec père et mère (art. 175, al. 5)", restricted: true,
      filename: `Acte_${acte.numero}_extrait_avec_filiation.pdf`, payload: { t: "EF", ...base },
      render: (p) => <Extrait acte={acte} deliv={deliv} filiation {...p} /> },
    { key: `${prefix}-es`, group: "Copies et extraits", label: "Extrait sans filiation", desc: "Délivrable à tout requérant (art. 175, al. 4)",
      filename: `Acte_${acte.numero}_extrait_sans_filiation.pdf`, payload: { t: "ES", ...base },
      render: (p) => <Extrait acte={acte} deliv={deliv} filiation={false} {...p} /> },
  ];
};

export const DOC_TYPES = {
  CI: "Acte de naissance : copie intégrale d'après la souche",
  V1: "Acte de naissance : volet n°1 (souche)",
  V2: "Acte de naissance : volet n°2 (archives)",
  V3: "Acte de naissance : volet n°3 (mère)",
  EF: "Extrait d'acte de naissance avec filiation",
  ES: "Extrait d'acte de naissance sans filiation",
  CN: "Certificat de naissance",
  RD: "Récépissé de déclaration de naissance",
  TJ: "Transcription de jugement supplétif",
  DN: "Déclaration de naissance",
  NI: "Attestation de non-inscription",
  FJ: "Fiche de réception de jugement",
  PR: "Procès-verbal de registre",
  MM: "Avis de mention marginale",
  RC: "Procès-verbal de rectification",
  FH: "Fiche d'habilitation",
};

export const DOCUMENTS = {
  actes: (a) => acteDocs(acteFromActe(a), a.id),
  declarations: (d) => {
    const docs = [{
      key: `${d.id}-dn`, label: "Déclaration de naissance", desc: "Formulaire signé par le déclarant", group: "Dossier de déclaration",
      filename: `Declaration_${d.id}.pdf`,
      payload: { t: "DN", n: d.id, c: CENTRE.code, nom: `${d.nom} ${d.prenoms}`, dn: d.dateNaissance, e: d.declaration },
      render: (p) => <DeclarationNaissance d={d} {...p} />,
    }, {
      group: "Dossier de déclaration",
      key: `${d.id}-rec`, label: "Récépissé de déclaration", desc: "Remis au déclarant au dépôt du dossier",
      filename: `Recepisse_${d.id}.pdf`,
      payload: { t: "RD", n: d.id, c: CENTRE.code, nom: `${d.nom} ${d.prenoms}`, dn: d.dateNaissance, e: d.declaration },
      render: (p) => <Recepisse d={d} {...p} />,
    }];
    if (d.delai === "hors") docs.push({
      key: `${d.id}-ni`, label: "Attestation de non-inscription", desc: "Hors délai : à joindre à la requête au tribunal (art. 172)", group: "Dossier de déclaration",
      filename: `Non_inscription_${d.id}.pdf`,
      payload: { t: "NI", n: d.id, c: CENTRE.code, nom: `${d.nom} ${d.prenoms}`, dn: d.dateNaissance, e: d.declaration },
      render: (p) => <AttestationNonInscription d={d} deliv={delivrance()} {...p} />,
    });
    if (d.statut === "ACTE_SIGNE") docs.push(...acteDocs(acteFromDeclaration(d), d.id));
    return docs;
  },
  certificats: (c) => [{
    key: `${c.id}-cn`, label: "Certificat de naissance", desc: c.statut === "Brouillon" ? "Brouillon : non transmis" : "Signé par le praticien",
    filename: `Certificat_${c.id}.pdf`,
    payload: { t: "CN", n: c.id, c: "MATLBV", nom: c.enfant, dn: c.dateNaissance, e: c.transmis || c.dateNaissance },
    render: (p) => <CertificatNaissance c={c} {...p} />,
  }],
  jugements: (j) => [{
    key: `${j.id}-fj`, label: "Fiche de réception du jugement", desc: "Références, dispositif et suivi de la procédure",
    filename: `Fiche_${j.id}.pdf`,
    payload: { t: "FJ", n: j.id, c: CENTRE.code, nom: j.enfant, dn: j.dateNaissanceRetenue || "", e: j.dateReception },
    render: (p) => <FicheJugement j={j} {...p} />,
  }, ...(j.transcription ? [{
    key: `${j.id}-tr`, label: "Transcription du jugement", desc: "Dispositif transcrit sur le registre (art. 164)",
    filename: `Transcription_${j.id}.pdf`,
    payload: { t: "TJ", n: j.id, c: CENTRE.code, nom: j.enfant, dn: j.dateNaissanceRetenue, e: j.transcription.date },
    render: (p) => <Transcription j={j} {...p} />,
  }] : [])],
  registres: (r) => [{
    key: `${r.id}-pv`, label: r.statut === "Clôturé" ? "Procès-verbal de clôture" : "Procès-verbal d'ouverture", desc: "Registre coté et paraphé (art. 158)",
    filename: `PV_${r.id}.pdf`,
    payload: { t: "PR", n: r.id, c: CENTRE.code, nom: r.centre, dn: "", e: r.ouverture },
    render: (p) => <PVRegistre r={r} {...p} />,
  }],
  mentions: (m) => [{
    key: `${m.id}-mm`, label: "Avis de mention marginale", desc: m.type,
    filename: `Mention_${m.id}.pdf`,
    payload: { t: "MM", n: m.id, c: CENTRE.code, nom: m.acte, dn: "", e: m.dateDecision },
    render: (p) => <AvisMention m={m} {...p} />,
  }],
  rectifications: (r) => [{
    key: `${r.id}-rc`, label: "Procès-verbal de rectification", desc: r.champ,
    filename: `Rectification_${r.id}.pdf`,
    payload: { t: "RC", n: r.id, c: CENTRE.code, nom: r.acte, dn: "", e: "" },
    render: (p) => <PVRectification r={r} {...p} />,
  }],
  utilisateurs: (u) => [{
    key: `${u.id}-fh`, label: "Fiche d'habilitation", desc: u.role,
    filename: `Habilitation_${u.identifiant}.pdf`,
    payload: { t: "FH", n: u.id, c: CENTRE.code, nom: u.nom, dn: "", e: "" },
    render: (p) => <FicheHabilitation u={u} perms={PERMS[u.role] ?? []} {...p} />,
  }],
};

const PERMS = {
  "Administrateur": [["Utilisateurs et rôles", "Autorisé"], ["Paramètres et sauvegardes", "Autorisé"], ["Statistiques", "Autorisé"], ["Journal d'audit", "Autorisé"], ["Signature des actes", "Non autorisé"]],
  "Officier d'état civil": [["Validation et signature", "Autorisé"], ["Transcription", "Autorisé"], ["Mentions marginales", "Autorisé"], ["Délivrance", "Autorisé"], ["Gestion des comptes", "Non autorisé"]],
  "Agent d'état civil": [["Réception et saisie", "Autorisé"], ["Contrôle des pièces", "Autorisé"], ["Numérisation", "Autorisé"], ["Signature des actes", "Non autorisé"], ["Mentions marginales", "Non autorisé"]],
  "Consultation": [["Recherche d'actes", "Autorisé"], ["Modification", "Non autorisé"], ["Délivrance", "Non autorisé"]],
};
