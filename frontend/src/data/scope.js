// Périmètre des données et des documents selon le rôle connecté.

/** Lignes visibles : un établissement de santé ne voit que les naissances survenues chez lui. */
export const rowScope = (source, user) => (row) => {
  if (user.role === "hopital" && source === "declarations") return row.lieu === user.centre;
  return true;
};

// Documents propres à l'établissement de santé : pas d'actes, de volets, de copies ni d'extraits.
const HOPITAL_DOCS = /-(dn|rec|cn)$/;

/** Documents visibles pour un rôle. */
export const docScope = (user) => (doc) => {
  if (user.role === "consultation") return !doc.restricted;
  if (user.role === "hopital") return HOPITAL_DOCS.test(doc.key);
  return true;
};
