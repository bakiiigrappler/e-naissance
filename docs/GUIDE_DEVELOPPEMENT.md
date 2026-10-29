# Guide de développement : e-Naissance

Ce guide s'adresse aux développeurs qui reprennent le projet. Il explique **comment le frontend est construit**, **les règles à respecter** pour le faire évoluer sans le casser, puis **ce qu'il reste à faire**, par ordre de priorité.

Référence fonctionnelle : [`Cahier_des_charges_Gestion_Actes_Naissance_Gabon.pdf`](Cahier_des_charges_Gestion_Actes_Naissance_Gabon.pdf). Les numéros de section cités ci-dessous (« CdC § 15 ») renvoient à ce document.

---

## 1. État actuel en bref

| Élément | État |
|---|---|
| Frontend React | Fonctionnel, données **fictives en mémoire** |
| Backend / base de données | **À construire** |
| Authentification | Simulée : 5 comptes de démonstration, session dans `sessionStorage` |
| Documents PDF | Générés dans le navigateur (html2canvas + jsPDF), signés ECDSA **avec une clé de démonstration** |
| Écrans « en préparation » | Statistiques, Paramètres |

Ce qui fonctionne déjà :

- **Espaces par rôle** : administrateur, officier, agent, établissement de santé, consultation.
- **Écrans liste** avec recherche, filtres et pagination, et panneaux latéraux de création, de modification et de détails : déclarations, actes, certificats, jugements, rectifications, mentions, registres, utilisateurs, journal.
- **Documents PDF** au format des actes gabonais : registre à souches en trois volets, copie intégrale, extraits, certificat, déclaration, récépissé, attestation de non-inscription, procès-verbaux, fiche d'habilitation.
- **Page publique** `/verifier` pour contrôler la signature d'un document.

---

## 2. Lancer le projet

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173/connexion
npm run build      # vérification : doit compiler sans erreur
```

Les comptes de démonstration sont listés dans le [README](../README.md) et affichés sur la page de connexion.

---

## 3. Architecture du frontend

```
frontend/src/
├── main.jsx               Fournisseurs globaux : routeur, animations, authentification, notifications
├── App.jsx                Routes + table PAGES (écran → configuration) + contrôle d'accès (Guarded)
├── auth.jsx               Comptes, rôles, session, canAccess / canWrite, RequireAuth
├── index.css              Toute la charte graphique (jetons de couleur, composants, thème sombre)
├── data/
│   ├── menu.js            Menu + droits par rôle (roles = voir, write = créer/modifier)
│   ├── resources.jsx      Configuration de chaque écran liste (colonnes, formulaire, détails, données)
│   ├── mock.js            Données des tableaux de bord, libellés des statuts, fiches des centres
│   └── scope.js           Périmètre par rôle (lignes visibles, documents visibles)
├── components/
│   ├── Layout.jsx         Barre latérale, barre du haut, recherche Ctrl K, fenêtre de déconnexion
│   ├── ResourcePage.jsx   Écran liste générique (tableau + panneaux latéraux + visualiseur PDF)
│   ├── Drawer.jsx         Panneau latéral (offcanvas)
│   ├── DocumentViewer.jsx Génération et affichage des PDF
│   ├── ConfirmModal.jsx   Fenêtre de confirmation
│   ├── Toast.jsx          Notifications (useToast)
│   ├── EmptyState.jsx     Affichage « aucune donnée »
│   ├── Skeleton.jsx       Blocs de chargement
│   ├── Brand.jsx          Bande tricolore, chargeur au logo
│   ├── Hero.jsx, ui.jsx   Bandeau d'accueil, cartes d'indicateurs, panneaux, badges de statut
│   └── CentreCard.jsx     Centre en cours (barre latérale)
├── pages/
│   ├── Dashboard.jsx      Tableau de bord officier / agent + aiguillage par rôle
│   ├── RoleDashboards.jsx Tableaux de bord administrateur, consultation, établissement de santé
│   ├── Documents.jsx      Catalogue de tous les documents
│   ├── Login.jsx, Verify.jsx, Placeholder.jsx
├── documents/
│   ├── templates.jsx      Modèles A4 des documents (formulaire à lignes pointillées)
│   ├── registry.jsx       Quels documents pour quel enregistrement (DOCUMENTS, DOC_TYPES)
│   ├── data.js            Construction des données d'acte à partir des enregistrements
│   ├── signature.js       Signature ECDSA, code signé, vérification
│   ├── format.js          Dates et heures en toutes lettres, articles (« à la Maternité »)
│   ├── Sceau.jsx          Sceau de la République (stylisé)
│   └── doc.css            Styles des documents A4
└── hooks/useLoading.js    Temps de chargement simulé (à remplacer par les appels API)
```

### 3.1 Le principe central : les écrans sont pilotés par configuration

Un écran liste n'est **pas** codé à la main. C'est un objet de configuration dans `data/resources.jsx`, affiché par le composant générique `ResourcePage` :

```js
export const monEcran = {
  title, subtitle, entity, icon, createLabel,
  rows: [...],                       // données (à remplacer par l'API)
  searchKeys: ["id", "nom"],         // champs utilisés par la recherche
  kpis: (rows) => [{ label, value, tone }],
  filters: [{ key, label, test: (row) => bool }],
  columns: [{ key, label, render?: (row) => JSX, className? }],
  canEdit: (row) => bool,            // ex. un acte signé n'est pas modifiable
  form: { defaults: {...}, sections: [{ title, note?, fields: [{ name, label, type, options, required, full, hint }] }] },
  newRow: (values, rows) => ({ ...values, id: "..." }),
  detail: (row) => ({ title, subtitle, tone, badge, facts?, tabs: [{ key, label, sections: [...] }] }),
  empty: { icon, title, text },      // affichage quand la liste est vide
};
```

- **Types de champs** : `text`, `date`, `time`, `number`, `email`, `select` (avec `options`), `textarea`.
- **Sections de détail** : `type: "fields"` (paires libellé / valeur), `"files"` (pièces) ou `"timeline"` (historique), chacune avec un état `empty`.

### 3.2 Les droits

- **Accès à un écran** : défini **une seule fois** dans `data/menu.js` (`roles` pour voir, `write` pour créer ou modifier). `canAccess` et `canWrite` lisent cette table, et `Guarded` (App.jsx) l'applique à toutes les routes.
- **Périmètre des données** : défini dans `data/scope.js`. Par exemple, un hôpital ne voit que ses naissances, et le compte Consultation que les documents non réservés.
- **Masquer une entrée du menu sans bloquer l'écran** : `hiddenFor: ["role"]`. **Changer le libellé pour un rôle** : `labelFor: { role: "..." }`.

### 3.3 Les documents PDF

1. `registry.jsx` liste les documents disponibles pour chaque enregistrement : `{ key, label, desc, group, restricted, filename, payload, render }`.
2. `DocumentViewer` **signe** le `payload` (ECDSA P-256), produit le QR code, rend le modèle **hors écran** (portail React), le capture avec html2canvas, puis crée le PDF A4 avec jsPDF.
3. Les modèles (`templates.jsx`) réutilisent toujours les mêmes briques : `Page`, `Entete`, `L` (ligne pointillée), `Pair`, `ParentBlock`, `Mentions`, `Certification`, `SignOfficier`, `Securite`.

---

## 4. Règles à respecter (charte et conventions)

### Charte graphique
- **Couleurs** : bleu foncé, noir et blanc. Le **vert / jaune / bleu** du Gabon s'utilise **avec parcimonie** (bande en haut de la barre latérale, repère du lien actif, statuts, tendances). Pas de drapeau dans les cadres.
- **Aucun dégradé.** Uniquement des couleurs unies.
- **Arrondis modestes** : de 6 à 10 px pour les cartes et les champs. Seuls les petits badges sont en forme de pilule.
- **Utiliser les jetons** définis dans `:root` de `index.css` (`--primary`, `--surface`, `--border`, `--gabon-green`, `--green-soft`…), **jamais de couleur en dur** dans les composants. Tout nouveau style doit fonctionner en **thème sombre** (`:root[data-theme="dark"]`).
- **Rouge** réservé aux alertes : hors délai, erreurs, déconnexion.
- **Police** : Plus Jakarta Sans pour l'interface. Les documents utilisent Arial pour le texte et Courier pour les valeurs saisies.

### Composants et animations
- **Réutiliser l'existant** avant d'en créer un nouveau : `Panel`, `StatCard`, `Badge`, `StatusBadge`, `Person`, `EmptyState`, `Drawer`, `ConfirmModal`, `LogoLoader`, `Sk` et `TableSkeletonRows`, `useToast`.
- **Animations** avec framer-motion, courtes (0,15 à 0,4 s). Le réglage système « réduire les animations » est respecté par `MotionConfig`.
- **États de chargement** : blocs gris pulsés et chargeur au logo, **jamais un écran blanc**.
- **Toute liste doit avoir un état vide** (`EmptyState`), et un message spécifique quand une recherche ne trouve rien.

### Documents officiels
- **Suivre le modèle d'acte gabonais** : en-tête centré (République Gabonaise, province, commune, centre), formulaire à lignes pointillées, valeurs en majuscules bleu encre, renvois numérotés (1) à (7), « L'Officier d'État Civil (signature et timbre) », **sceau de la République**, note sur les rectifications.
- **Moitié gauche** réservée aux mentions marginales, aux certifications et au bloc de sécurité (QR code et code signé).
- **Format A4 sur une seule page** : vérifier qu'aucun bloc ne déborde (voir § 6, tests).
- **Tant que les données sont fictives**, garder le filigrane « SPÉCIMEN » et la mention « sans valeur légale ».

### Code et contenu
- **Interface et commentaires en français.** Statuts en majuscules, conformes au CdC § 20 (`EN_ATTENTE_VALIDATION`…), avec leur libellé dans `STATUTS` (mock.js).
- **Jamais de vraies données de personnes**, ni dans le code, ni dans les tests, ni dans les captures.
- **Vérifier que la compilation passe** (`npm run build`) avant chaque commit.

---

## 5. Recettes : comment faire

### 5.1 Ajouter un écran liste
1. **Configuration** : ajouter un objet dans `data/resources.jsx` (voir § 3.1).
2. **Menu et droits** : ajouter une entrée dans `data/menu.js`, avec `path`, `label`, `icon` (lucide-react), `roles` et `write`.
3. **Branchement** : déclarer l'écran dans la table `PAGES` de `App.jsx` : `"/mon-ecran": { config: monEcran, documents: DOCUMENTS.monEcran }`.
4. **Documents (facultatif)** : les déclarer dans `documents/registry.jsx` et ajouter la source dans `SOURCES` de `pages/Documents.jsx`.
5. **Périmètre (si besoin)** : ajouter la règle dans `data/scope.js`.

### 5.2 Ajouter un champ à un formulaire
- **Formulaire** : ajouter le champ dans la bonne `section` de `form.sections`, avec `required: true` s'il est obligatoire. La jauge de progression et la validation se mettent à jour automatiquement.
- **Affichage** : l'ajouter aussi dans `detail()` pour qu'il apparaisse dans la vue détails, et dans les données des documents si nécessaire.

### 5.3 Ajouter un statut
- **Libellé et couleur** : déclarer le statut dans `STATUTS` (mock.js) avec un `tone` existant (`navy`, `soft`, `dark`, `outline`, `muted`, `alert`, `green`, `yellow`, `blue`).

### 5.4 Ajouter un document PDF
1. **Modèle** : écrire le composant dans `documents/templates.jsx` en réutilisant `Page`, `Entete`, `L`, `Securite` et `SignOfficier`.
2. **Déclaration** : l'ajouter dans `DOCUMENTS` (`registry.jsx`) avec une **clé unique**, un `payload` (données signées : `t`, `n`, `c`, `nom`, `dn`, `e`), un `group` et `restricted: true` si la délivrance est réservée (CdC § 15 et art. 175 du Code civil).
3. **Libellé de vérification** : ajouter le code de `t` dans `DOC_TYPES`, pour que la page `/verifier` l'affiche.
4. **Rôles concernés** : vérifier `docScope` (scope.js), par exemple la liste des documents propres à l'hôpital.
5. **Contrôle de mise en page** : générer le PDF et vérifier qu'il tient sur une page.

### 5.5 Ajouter un rôle
1. **Rôle et compte** : déclarer le rôle dans `ACCOUNTS` et `ROLE_INFO` (auth.jsx).
2. **Droits** : ajouter le rôle dans `roles` et `write` des entrées concernées de `menu.js`.
3. **Couleur du rôle** : ajouter sa couleur dans `ROLE_TONE` (Layout.jsx).
4. **Tableau de bord** : créer son tableau de bord dans `RoleDashboards.jsx` et l'aiguiller dans `RoleDashboard` (Dashboard.jsx).
5. **Périmètre** : ajouter ses règles de données et de documents dans `scope.js`.

### 5.6 Brancher le backend (sans changer l'architecture)
La structure est prévue pour que **seule la source des données change** :

1. **Couche API** : créer `src/api/` avec un client (`fetch` et jeton de session) et une fonction par opération (`listDeclarations`, `createDeclaration`…).
2. **Chargement des listes** : dans `ResourcePage`, remplacer `useLoading` et `config.rows` par un chargement API (par exemple TanStack Query). Les configurations gardent colonnes, formulaires et détails ; `rows` disparaît.
3. **Enregistrement** : remplacer le `setTimeout` de `save()` par l'appel API, et garder les notifications et la gestion d'erreurs existantes.
4. **Authentification** : remplacer `login()` (auth.jsx) par l'appel au serveur. Garder `useAuth`, `canAccess` et `RequireAuth`, mais faire **aussi** contrôler les droits par le serveur.
5. **Documents** : la signature doit passer **côté serveur**. Le serveur renvoie `{ token, code, hash, signature }` et `DocumentViewer` ne fait plus que le rendu. `verifyToken` interroge le serveur (registre des codes émis).

---

## 6. Ce qu'il reste à faire

### Priorité 1 : compléter le métier côté interface
- [ ] **Actions de workflow** sur les dossiers (CdC § 5, 20, 27) : transmettre pour validation, valider, établir, signer, archiver ; orienter vers le tribunal ; transcrire un jugement. Aujourd'hui, seule la modification des champs existe : il faut des **boutons d'action selon le statut et le rôle**, une confirmation (`ConfirmModal`) et une trace dans l'historique.
- [ ] **Contrôle anti-doublon** à la création d'une déclaration (CdC § 18) : rechercher par nom, prénoms, date et lieu de naissance, et nom des parents, puis afficher une alerte dans le panneau de création.
- [ ] **Numérotation automatique** des actes par centre, registre et année, avec contrôle d'unicité (CdC § 17).
- [ ] **Module Enfant trouvé** (CdC § 14 ; art. 171 du Code civil) : procès-verbal de découverte, puis acte tenant lieu d'acte de naissance.
- [ ] **Module Reconstitution d'acte** (CdC § 13 ; art. 162).
- [ ] **Demandes de copies et d'extraits** (CdC § 15) : enregistrement de la demande, contrôle des droits du demandeur (art. 175), délivrance et historique.
- [ ] **Pièces justificatives** : téléversement et numérisation, aperçu dans l'onglet « Pièces ».
- [ ] **Écran Statistiques** : naissances par mois, par centre et par sexe, délais, hors délai (CdC § 19).
- [ ] **Écran Paramètres** : centres, registres, délais légaux, modèles de documents.
- [ ] **Recherche globale** (Ctrl K) : elle ne propose aujourd'hui que des écrans ; il faut qu'elle cherche aussi les actes et les dossiers.
- [ ] **Persistance partagée** entre écrans : un enregistrement créé dans une liste n'apparaît pas encore dans la page Documents ni dans les tableaux de bord. Cela se règlera avec l'API.

### Priorité 2 : backend et données
- [ ] **API** : le CdC propose PHP/MySQL (CdC § 24, liste des tables). Laravel est recommandé dans le plan de travail.
- [ ] **Authentification** : sessions sécurisées, mots de passe hachés, rôles et permissions, verrouillage après plusieurs échecs.
- [ ] **Journal d'audit côté serveur** (CdC § 23) : utilisateur, action, date et heure, acte concerné, ancienne et nouvelle valeur, résultat.
- [ ] **Signature des documents côté serveur** (HSM) et registre central des codes émis ; **supprimer la clé privée de démonstration** du frontend.
- [ ] **Stockage des pièces et des PDF**, sauvegardes et plan de restauration (CdC § 22).
- [ ] **Protection des données personnelles** (loi gabonaise n°001/2011) : hébergement, chiffrement, durées de conservation.

### Priorité 3 : qualité et mise en production
- [ ] **Tests** : unitaires (Vitest et Testing Library) pour `format.js`, `signature.js`, `scope.js` et les configurations ; tests de bout en bout (Playwright) pour la connexion par rôle, la création d'une déclaration et la génération de chaque PDF, avec un contrôle qu'il tient sur une page.
- [ ] **Outillage** : ESLint et Prettier, et une intégration continue GitHub Actions qui lance `npm run build` et les tests.
- [ ] **Découpage du code** : charger le visualiseur PDF et les graphiques à la demande (le paquet dépasse 500 ko).
- [ ] **Avertissements React Router** : activer les options `v7_startTransition` et `v7_relativeSplatPath`.
- [ ] **Accessibilité** : navigation au clavier dans les panneaux et les tableaux, contrastes, libellés ARIA.
- [ ] **Mode hors connexion** pour les centres ruraux, à étudier (voir le plan de travail).

### À faire valider par les services de l'état civil
- [ ] **Présentation des documents** : comparer avec les formulaires officiels du ministère (volets, rubriques, renvois).
- [ ] **Fichier vectoriel officiel des armoiries**, à intégrer dans `documents/Sceau.jsx`, qui contient aujourd'hui une version stylisée.
- [ ] **Délai légal de déclaration** : le Code civil de 1972 (art. 169) indique 3 jours, la loi n°004/2021 deux semaines ou un mois. L'application applique la loi de 2021.
- [ ] **Règles de délivrance** des copies et extraits selon le demandeur (art. 175).
- [ ] **Rôle exact de l'établissement de santé** : déclaration directe ou simple transmission du certificat.

---

## 7. Avant de proposer une modification

1. `npm run build` passe sans erreur.
2. L'écran a été vérifié avec **chaque rôle concerné**, en **thème clair et sombre**, sur **ordinateur et mobile**.
3. Les **états vides et de chargement** s'affichent correctement.
4. Les **documents PDF** modifiés tiennent sur une page A4.
5. Aucune **donnée réelle** ni aucun **secret** n'est ajouté au dépôt.
