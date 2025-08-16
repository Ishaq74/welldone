-- Master SQL file to run all database setup scripts

-- This file should be run after Better Auth migration
-- to add additional indexes, triggers, and procedures

\echo 'Setting up additional indexes...'
\i indexes/user_indexes.sql
\i indexes/session_indexes.sql
\i indexes/organization_indexes.sql

\echo 'Setting up triggers...'
\i triggers/user_triggers.sql
\i triggers/session_triggers.sql

\echo 'Setting up CRUD procedures...'
\i procedures/user_crud.sql

\echo 'Database setup complete!'

-- Schedule cleanup jobs (requires pg_cron extension, optional)
-- If pg_cron is available, uncomment these lines:
-- SELECT cron.schedule('cleanup-expired-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');
-- SELECT cron.schedule('auto-unban-expired', '*/10 * * * *', 'SELECT auto_unban_expired_users();');