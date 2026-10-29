import { useEffect, useState } from "react";

/**
 * Simule le temps de chargement des données.
 * À remplacer par l'appel réel à l'API quand le backend sera prêt.
 */
export function useLoading(ms = 1200) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
