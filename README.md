
# Welldone

Projet **Astro** sans framework : uniquement **Astro**, **CSS** et **TypeScript** !

## 🗄️ Base de données PostgreSQL & Authentification

Le projet utilise **PostgreSQL** pour la gestion des données et **Better Auth** pour l'authentification et la gestion des rôles, avec une connexion centralisée via un pool pg (`pg.Pool`).

## 📦 Packages utilisés

- `astro` (^5.13.2)
- `astro-font` (^1.1.0)
- `pg` (PostgreSQL)
- `better-auth` (authentification, rôles, organisations)
- `nodemailer` (envoi d'emails SMTP)
- `astro-icon`, `@iconify-json/mdi` (icônes SVG)
- `vitest` (tests unitaires)
- `@vitest/ui` (interface graphique pour Vitest)
- `@types/pg`, `@types/nodemailer` (types TypeScript)

## Détail des tables Better Auth

| Table         | Champs principaux                                                                                   |
|-------------- |----------------------------------------------------------------------------------------------------|
| user          | id, name, email, emailVerified, image, createdAt, updatedAt, username, displayUsername, role, banned, banReason, banExpires |
| session       | id, expiresAt, token, createdAt, updatedAt, ipAddress, userAgent, userId, impersonatedBy, activeOrganizationId |
| account       | id, accountId, providerId, userId, accessToken, refreshToken, idToken, accessTokenExpiresAt, refreshTokenExpiresAt, scope, password, createdAt, updatedAt |
| verification  | id, identifier, value, expiresAt, createdAt, updatedAt                                             |
| organization  | id, name, slug, logo, createdAt, metadata                                                          |
| member        | id, organizationId, userId, role, createdAt                                                        |
| invitation    | id, organizationId, email, role, status, expiresAt, inviterId                                      |

Chaque table est créée et gérée automatiquement par Better Auth lors de la migration (`npx @better-auth/cli migrate`).

Projet **Astro** sans framework : uniquement **Astro**, **CSS** et **TypeScript** !

## 🧪 Tests

Les tests unitaires sont gérés avec **Vitest**.

Commandes utiles :

```sh
npm run test           # Lance les tests Vitest
npx vitest             # Interface CLI
npx vitest --ui        # Interface graphique
```

## 🗄️ Base de données & Authentification

- PostgreSQL (via `pg.Pool`)
- Better Auth (utilisateurs, sessions, organisations, rôles)
- Migration Better Auth :
- Tables : user, session, account, verification, organization, member, invitation

## 🔒 Authentification & Sécurité

- Inscription, connexion, déconnexion, mot de passe oublié, vérification email
- Envoi d'emails transactionnels via SMTP (configurable dans `.env`)
- Gestion des rôles (admin, user) et organisations
- Middleware Astro pour injection de session utilisateur

## 🗂️ Arborescence principale

```text
welldone/
├── .env
├── astro.config.mjs
├── env.d.ts
├── middleware.ts
├── package-lock.json
├── package.json
├── public/
│   └── favicon.svg
├── README.md
├── tasks.md
├── tsconfig.json
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   ├── Details.astro
│   │   │   ├── Input.astro
│   │   │   ├── Link.astro
│   │   │   ├── List.astro
│   │   │   ├── Map.astro
│   │   │   ├── Section.astro
│   │   │   ├── StaticMap.astro
│   │   │   ├── Table.astro
│   │   │   ├── Text.astro
│   │   │   ├── Wrapper.astro
│   │   │   └── Wrapper2.astro
│   │   ├── auth/
│   │   │   ├── AuthModal.astro
│   │   │   └── UserMenu.astro
│   │   ├── cards/
│   │   │   ├── PostCard.astro
│   │   │   ├── PostCategoryCard.astro
│   │   │   ├── RestaurantCard.astro
│   │   │   ├── UserCard.astro
│   │   │   └── ValueCard.astro
│   │   ├── molecules/
│   │   │   ├── Animation.astro
│   │   │   ├── CardCategory.astro
│   │   │   ├── CardIcon.astro
│   │   │   ├── CardPost.astro
│   │   │   ├── CardProduct.astro
│   │   │   ├── Carousel.astro
│   │   │   ├── CounterUp.astro
│   │   │   ├── Gallery.astro
│   │   │   └── Slider.astro
│   │   ├── navigations/
│   │   │   └── NavItem.astro
│   │   ├── organisms/
│   │   │   ├── Faq.astro
│   │   │   ├── Form.astro
│   │   │   ├── Gallery.astro
│   │   │   ├── QueryLoop.astro
│   │   │   └── Timeline.astro
│   │   ├── templates/
│   │   │   ├── Footer.astro
│   │   │   └── Header.astro
│   ├── fonts/
│   │   ├── Bowlby_One_SC/
│   │   │   └── BowlbyOneSC-Regular.ttf
│   │   ├── Palanquin_Dark/
│   │   │   ├── PalanquinDark-Bold.ttf
│   │   │   ├── PalanquinDark-Medium.ttf
│   │   │   ├── PalanquinDark-Regular.ttf
│   │   │   └── PalanquinDark-SemiBold.ttf
│   ├── layouts/
│   │   ├── AdminLayout.astro
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── auth-client.ts
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── smtp.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   └── index.astro
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── [...all].ts
│   │   │       ├── forgot-password.ts
│   │   │       ├── register.ts
│   │   │       ├── sign-in/
│   │   │       │   └── email.ts
│   │   │       ├── signout.ts
│   │   │       └── verify-email.ts
│   │   ├── docs/
│   │   │   ├── components.astro
│   │   │   ├── data.astro
│   │   │   └── theme.astro
│   │   ├── index.astro
│   │   └── profil.astro
│   ├── styles/
│   │   └── global.css
```

## 🔗 Endpoints principaux (100% réels, branchés, sans simulation)

- `/api/auth/register` : inscription (Better Auth, DB réelle)
- `/api/auth/sign-in/email` : connexion (Better Auth, DB réelle)
- `/api/auth/signout` : déconnexion (Better Auth, DB réelle)
- `/api/auth/forgot-password` : mot de passe oublié (Better Auth, SMTP réel)
- `/api/auth/verify-email` : vérification email (Better Auth, SMTP réel)

## 🧑‍💻 Pages et composants clés (branchées sur le backend)

- `AuthModal.astro` : modal d'inscription/connexion (formulaires branchés sur API)
- `UserMenu.astro` : menu utilisateur (profil, admin, déconnexion, session réelle)
- `profil.astro` : page profil utilisateur (affiche infos réelles)
- `admin/index.astro` : dashboard admin (accès réservé, rôle réel)

## 🔒 Sécurité & rôles

- Gestion des rôles (admin, user) via Better Auth
- Middleware Astro pour injection de session utilisateur dans `Astro.locals.user`

## 📧 Configuration ENV

Configurer `.env`

```env
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Configuration SMTP
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```
