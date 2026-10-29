// Construit les données des documents à partir des enregistrements (données FICTIVES).
import { declarations, certificats } from "../data/resources.jsx";
import { today } from "./format.js";

export const CENTRE = {
  province: "Province de l'Estuaire",
  commune: "Commune de Libreville",
  centre: "Centre d'état civil de Libreville",
  arrondissement: "1er arrondissement",
  ville: "Libreville",
  code: "LBV1",
  officier: "OBAME Christian",
};

// Numéros d'acte attribués aux déclarations signées (cohérent avec la liste des actes)
const ACTE_NUM = { "DN-2026-04817": "1254", "DN-2026-04812": "1253", "DN-2026-04810": "1252" };

// Coutume (rubrique propre aux actes gabonais) : valeurs fictives
const COUTUMES = { NZÉ: "Fang", NDONG: "Fang", MBA: "Fang", OBIANG: "Fang", NGUEMA: "Fang", ONDO: "Fang", MINTSA: "Fang", ESSONE: "Fang",
  MOUSSAVOU: "Punu", BOUSSOUGOU: "Punu", KOUMBA: "Punu", IBINGA: "Punu", MOUELE: "Myènè", BIYOGO: "Fang", OYANE: "Fang", MAKAYA: "Nzebi", NDEMBI: "Nzebi", AKOUE: "Fang", ELLA: "Fang" };
const coutume = (nom = "") => COUTUMES[nom.split(" ")[0]] ?? "Fang";

const parent = (nom, profession, domicile, dateNaissance, cni, lieuNaissance = "Libreville") =>
  nom ? { nom, profession, domicile, dateNaissance, lieuNaissance, nationalite: "Gabonaise", coutume: coutume(nom), cni } : null;

const bulletinFor = (mereNom) => certificats.rows.find((c) => c.mere === mereNom);

/** Données d'acte à partir d'une déclaration. */
export function acteFromDeclaration(d, numero = ACTE_NUM[d.id] ?? "—") {
  const b = bulletinFor(d.mereNom);
  return {
    numero, annee: d.dateNaissance?.slice(0, 4) ?? "2026", registre: "REG-LBV1-N-2026",
    enfant: { nom: d.nom, prenoms: d.prenoms, sexe: d.sexe, dateNaissance: d.dateNaissance, heure: d.heure, lieu: d.lieu, commune: d.commune },
    pere: parent(d.pereNom, d.pereProfession, d.mereDomicile, "1990-02-08", d.pereCni),
    mere: parent(d.mereNom, d.mereProfession, d.mereDomicile, d.mereDateNaissance, d.mereCni),
    declarant: { nom: d.declarantNom, qualite: d.declarantQualite, piece: d.declarantPiece },
    bulletin: b ? { numero: b.id, etablissement: b.etablissement } : { numero: `CN-2026-${d.id.slice(-5)}`, etablissement: d.lieu },
    dateDeclaration: d.declaration, heureDeclaration: "10:30",
    mentions: (d.mentions ?? []).map((m) => ({ texte: m.action, date: m.date })),
    dossier: d.id, statut: d.statut,
  };
}

/** Données d'acte à partir de la liste des actes (complétées par la déclaration d'origine si elle existe). */
export function acteFromActe(a) {
  const decl = declarations.rows.find((d) => `${d.nom} ${d.prenoms}` === a.enfant);
  const numero = a.id.replace("N°2026-", "");
  const mentions = a.mentions.map((m) => ({ texte: m.action, date: m.date }));
  if (decl) return { ...acteFromDeclaration(decl, numero), mentions };
  const [nom, ...prenoms] = a.enfant.split(" ");
  return {
    numero, annee: a.dateNaissance.slice(0, 4), registre: a.registre,
    enfant: { nom, prenoms: prenoms.join(" "), sexe: a.sexe, dateNaissance: a.dateNaissance, heure: "07:15", lieu: "Maternité de Libreville", commune: "Libreville" },
    pere: parent(`${nom} Alain`, "Fonctionnaire", "Quartier Nzeng-Ayong, Libreville", "1989-04-02", "GA-4471-2290", "Oyem"),
    mere: parent(`${nom} Henriette`, "Commerçante", "Quartier Nzeng-Ayong, Libreville", "1993-09-14", "GA-5520-1137"),
    declarant: { nom: `${nom} Alain`, qualite: "Père", piece: "CNI GA-4471-2290" },
    bulletin: { numero: `CN-2026-00${numero.slice(-3)}`, etablissement: "Maternité de Libreville" },
    dateDeclaration: a.dateEtablissement, heureDeclaration: "09:45",
    mentions, dossier: "—", statut: a.statut,
  };
}

export const delivrance = () => ({ date: today(), ville: CENTRE.ville, officier: CENTRE.officier });
