# Tâches chronologiques pour le projet Welldone

## 1. Initialisation & Setup

- [x] Création du projet Astro
- [x] Configuration du repo, .env, tsconfig, package.json
- [x] Installation des dépendances principales (astro, pg, better-auth, astro-font, astro-icon, etc.)
- [x] Configuration des alias TypeScript
- [x] Mise en place du pool PostgreSQL (db.ts)

## 2. Authentification & Backend

- [x] Intégration Better Auth avec PostgreSQL
- [x] Migration des tables utilisateurs, sessions, organisations, etc.
- [x] Création de la page d'inscription
- [x] Création de la page de connexion
- [ ] Sécurisation des endpoints API (middleware auth)
- [ ] Scripts SQL pour la gestion des données (CRUD, index, triggers)
- [ ] Partis "utilisateurs" dans le dossier admin/utilisateurs.astro pour la gestion des utilisateurs complète
- [ ] Endpoints REST sécurisés et validation des données
- [ ] Configuration des rôles et permissions (admin, membre, invité, etc.)
- [ ] Gestion du bannissement (banned, banReason, banExpires)
- [ ] Ajout de tests sur la structure des tables et la logique d'authentification

## 3. Composants UI & Layouts

- [x] Organisation des composants par type (atoms, molecules, organisms, templates)
- [x] Création des layouts principaux (BaseLayout, AdminLayout)
- [ ] Layouts spécifiques (profil, organisation, etc.)
- [x] Footer, Header
- [ ] Ajout de templates pour pages spécifiques
- [x] Boutons, Inputs, Text, Card, etc.
- [x] CardCategory, CardIcon, Faq, Form, Gallery, QueryLoop, Timeline
- [ ] Props et slots documentés
- [ ] Exemples d'utilisation et tests visuels
- [ ] Composants complexes (tableaux, listes dynamiques)

## 4. Pages & Navigation

- [ ] Page d'accueil stylisée
- [ ] Page de profil utilisateur
- [ ] Page d'administration (gestion des membres, rôles)
- [ ] Pages organisations (création, gestion, invitation)
- [ ] Pages docs (documentation interne)
- [ ] Menu principal et navigation contextuelle
- [ ] Gestion des accès selon le rôle utilisateur

## 5. Design & Expérience utilisateur

- [x] Intégration des polices personnalisées (Bowlby One SC, Palanquin Dark)
- [x] Astro Icon, Material Design Icons
- [ ] Ajout d'animations et transitions sur les pages et composants
- [ ] Responsive : tests sur mobile et desktop

## 6. Documentation & Qualité

- [x] Mise à jour complète et exhaustive du README
- [ ] Guide d'installation et configuration
- [ ] Explication des variables d'environnement
- [ ] Exemples de requêtes API et flux d'authentification
- [ ] Ajout de tests unitaires et d'intégration
- [ ] Linting et conventions de code

---

Ajoute/modifie les tâches selon l'avancement ou les besoins du projet !
