# e-Naissance : gestion numérique des actes de naissance (Gabon)

Prototype d'application pour les centres d'état civil du Gabon : déclaration des naissances, établissement et signature des actes, procédures particulières (hors délai, jugements supplétifs, rectifications, mentions marginales), conservation et délivrance des documents.

> **Démonstration.** Toutes les données sont **fictives**. Les documents générés portent le filigrane « SPÉCIMEN » et la mention « sans valeur légale ».

## Contenu du dépôt

| Dossier | Contenu |
|---|---|
| `frontend/` | Application web React (Vite) |
| `docs/` | Cahier des charges et plan de travail du projet |

## Lancer l'application

Prérequis : Node.js 18 ou plus récent.

```bash
cd frontend
npm install
npm run dev
```

Puis ouvrir http://localhost:5173/connexion.

## Comptes de démonstration

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Administrateur | Admin01 | admin123 |
| Officier d'état civil | Officier01 | officier123 |
| Agent d'état civil | Agent01 | agent123 |
| Établissement de santé | Hopital01 | hopital123 |
| Consultation | Consult01 | consult123 |

## Fonctionnalités

- **Espaces par rôle** : administrateur, officier, agent, établissement de santé (maternité), consultation.
- **Déclarations de naissance** avec contrôle automatique du délai légal (loi n°004/2021).
- **Actes de naissance** et registre à souches en trois volets (souche, archives, mère).
- **Jugements supplétifs**, transcriptions, rectifications, mentions marginales, registres, utilisateurs, journal d'audit.
- **Documents PDF** (html2canvas + jsPDF) au format A4, sur le modèle des actes gabonais : volets, copie intégrale, extraits avec et sans filiation, certificat de naissance, déclaration, récépissé, attestation de non-inscription, procès-verbaux…
- **Sécurité des documents** : QR code et code signé (ECDSA P-256, empreinte SHA-256), page publique de vérification `/verifier`.
- Thème clair et sombre, interface responsive.

## Avertissement sécurité

La clé de signature présente dans `frontend/src/documents/signature.js` est une **clé de démonstration publique**. Elle ne doit **jamais** servir en production. En production, la signature des documents doit être faite côté serveur (idéalement dans un HSM) et le navigateur ne doit connaître que la clé publique.

## Références juridiques

- Loi n°15/72 du 29 juillet 1972 portant Code civil (art. 154 à 189 : actes de l'état civil)
- Loi n°004/2021 du 15 septembre 2021 (délais de déclaration)
- Loi n°008/2022 du 15 juin 2022 portant organisation de l'état civil
