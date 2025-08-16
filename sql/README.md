# SQL Database Setup and Management

Ce dossier contient tous les scripts SQL nécessaires pour optimiser et gérer la base de données PostgreSQL avec Better Auth.

## Structure

```
sql/
├── setup.sql                    # Script principal d'installation
├── indexes/                     # Indexes d'optimisation
│   ├── user_indexes.sql         # Indexes pour la table user
│   ├── session_indexes.sql      # Indexes pour la table session
│   └── organization_indexes.sql # Indexes pour les tables d'organisation
├── triggers/                    # Triggers automatiques
│   ├── user_triggers.sql        # Triggers pour la gestion des utilisateurs
│   └── session_triggers.sql     # Triggers pour la gestion des sessions
└── procedures/                  # Procédures stockées
    └── user_crud.sql           # Procédures CRUD pour les utilisateurs
```

## Installation

### Prérequis

1. PostgreSQL installé et configuré
2. Better Auth migrations exécutées (`npx @better-auth/cli migrate`)
3. Connexion à la base de données avec les droits appropriés

### Exécution

```bash
# Se connecter à PostgreSQL
psql -h localhost -U your_user -d your_database

# Exécuter le script principal
\i sql/setup.sql
```

Ou depuis l'application :

```bash
# Depuis le répertoire racine du projet
cd sql
psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -f setup.sql
```

## Fonctionnalités ajoutées

### Indexes d'optimisation

#### Table `user`
- Index sur email (case-insensitive)
- Index sur username (case-insensitive) 
- Index sur role pour les requêtes par rôle
- Index sur banned pour les utilisateurs bannis
- Index composite pour les utilisateurs actifs

#### Table `session`
- Index sur token pour les authentifications
- Index sur userId pour les sessions utilisateur
- Index sur expiresAt pour le nettoyage
- Index composite pour les sessions actives

#### Tables d'organisation
- Index sur slug et nom d'organisation
- Index sur les relations membre-organisation
- Index sur les invitations en attente

### Triggers automatiques

#### Gestion des bans
- **handle_ban_expiration()** : Gère la logique d'expiration des bans
- **auto_unban_expired_users()** : Déban automatiquement les utilisateurs expirés

#### Validation des données
- **validate_email_format()** : Valide le format des emails
- **update_updated_at()** : Met à jour automatiquement le timestamp

#### Gestion des sessions
- **limit_user_sessions()** : Limite le nombre de sessions simultanées (10 max)
- **log_session_activity()** : Log les créations/suppressions de sessions

### Procédures stockées

#### Gestion des utilisateurs
- **get_user_by_id(user_id)** : Récupère un utilisateur par ID
- **get_users_paginated()** : Liste paginée avec filtres et recherche
- **ban_user()** : Ban un utilisateur avec raison et expiration
- **unban_user()** : Déban un utilisateur
- **update_user_role()** : Change le rôle d'un utilisateur
- **delete_user()** : Suppression logique (ban permanent)

#### Maintenance
- **cleanup_expired_sessions()** : Nettoie les sessions expirées
- **auto_unban_expired_users()** : Déban les utilisateurs avec ban expiré

## Utilisation des procédures

### Lister les utilisateurs avec pagination

```sql
SELECT * FROM get_users_paginated(
    0,        -- offset (page 1 = 0, page 2 = 20, etc.)
    20,       -- limit (nombre par page)
    'admin',  -- filtre par rôle (null pour tous)
    false,    -- filtre par statut ban (null pour tous)
    'john'    -- terme de recherche (null pour tous)
);
```

### Bannir un utilisateur

```sql
SELECT ban_user(
    'user-id-123',
    'Violation des conditions d''utilisation',
    '2024-12-31 23:59:59'::timestamp  -- ou NULL pour permanent
);
```

### Débannir un utilisateur

```sql
SELECT unban_user('user-id-123');
```

### Changer le rôle d'un utilisateur

```sql
SELECT update_user_role('user-id-123', 'admin');
```

## Maintenance automatique

### Nettoyage des sessions expirées

Ajouter à votre crontab ou scheduler :

```bash
# Tous les jours à 2h du matin
0 2 * * * psql -d your_db -c "SELECT cleanup_expired_sessions();"

# Toutes les 10 minutes pour débannir automatiquement
*/10 * * * * psql -d your_db -c "SELECT auto_unban_expired_users();"
```

### Avec pg_cron (si disponible)

```sql
-- Installer pg_cron d'abord
SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');
SELECT cron.schedule('auto-unban-expired', '*/10 * * * *', 'SELECT auto_unban_expired_users();');
```

## Surveillance et logs

Les triggers loggent automatiquement :
- Créations et suppressions de sessions
- Bans et débans d'utilisateurs
- Erreurs de validation

Consulter les logs PostgreSQL pour le suivi :

```bash
tail -f /var/log/postgresql/postgresql-xx-main.log
```

## Sécurité

### Permissions recommandées

```sql
-- Créer un utilisateur dédié pour l'application
CREATE USER welldone_app WITH PASSWORD 'secure_password';

-- Accorder les permissions nécessaires
GRANT CONNECT ON DATABASE your_db TO welldone_app;
GRANT USAGE ON SCHEMA public TO welldone_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO welldone_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO welldone_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO welldone_app;
```

### Audit des actions

Pour un audit plus poussé, considérer l'ajout d'une table d'audit :

```sql
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    user_id TEXT,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Dépannage

### Index non créés

```sql
-- Vérifier les index existants
\di+ user*
\di+ session*
\di+ organization*

-- Recréer manuellement si nécessaire
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email_lower ON "user" (LOWER(email));
```

### Triggers non actifs

```sql
-- Lister les triggers
SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Recréer un trigger
DROP TRIGGER IF EXISTS trigger_ban_expiration ON "user";
CREATE TRIGGER trigger_ban_expiration
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    WHEN (OLD.banned IS DISTINCT FROM NEW.banned OR OLD.banExpires IS DISTINCT FROM NEW.banExpires)
    EXECUTE FUNCTION handle_ban_expiration();
```

### Performance

Surveiller les requêtes lentes :

```sql
-- Activer le log des requêtes lentes
SET log_min_duration_statement = 1000; -- 1 seconde

-- Analyser les statistiques
SELECT * FROM pg_stat_user_tables WHERE relname IN ('user', 'session');
SELECT * FROM pg_stat_user_indexes WHERE relname LIKE '%user%';
```