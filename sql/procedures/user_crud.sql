-- CRUD procedures for user management

-- Get user by ID with role and ban status
CREATE OR REPLACE FUNCTION get_user_by_id(user_id TEXT)
RETURNS TABLE(
    id TEXT,
    name TEXT,
    email TEXT,
    emailVerified TIMESTAMP,
    role TEXT,
    banned BOOLEAN,
    banReason TEXT,
    banExpires TIMESTAMP,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    username TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email, u.emailVerified, u.role, u.banned, 
           u.banReason, u.banExpires, u.createdAt, u.updatedAt, u.username
    FROM "user" u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Get all users with pagination and filtering
CREATE OR REPLACE FUNCTION get_users_paginated(
    page_offset INTEGER DEFAULT 0,
    page_limit INTEGER DEFAULT 20,
    role_filter TEXT DEFAULT NULL,
    banned_filter BOOLEAN DEFAULT NULL,
    search_term TEXT DEFAULT NULL
)
RETURNS TABLE(
    id TEXT,
    name TEXT,
    email TEXT,
    role TEXT,
    banned BOOLEAN,
    banReason TEXT,
    banExpires TIMESTAMP,
    createdAt TIMESTAMP,
    total_count BIGINT
) AS $$
DECLARE
    total_users BIGINT;
BEGIN
    -- Get total count first
    SELECT COUNT(*) INTO total_users
    FROM "user" u
    WHERE (role_filter IS NULL OR u.role = role_filter)
      AND (banned_filter IS NULL OR u.banned = banned_filter)
      AND (search_term IS NULL OR 
           LOWER(u.name) LIKE LOWER('%' || search_term || '%') OR
           LOWER(u.email) LIKE LOWER('%' || search_term || '%'));
    
    -- Return paginated results with total count
    RETURN QUERY
    SELECT u.id, u.name, u.email, u.role, u.banned, u.banReason, 
           u.banExpires, u.createdAt, total_users
    FROM "user" u
    WHERE (role_filter IS NULL OR u.role = role_filter)
      AND (banned_filter IS NULL OR u.banned = banned_filter)
      AND (search_term IS NULL OR 
           LOWER(u.name) LIKE LOWER('%' || search_term || '%') OR
           LOWER(u.email) LIKE LOWER('%' || search_term || '%'))
    ORDER BY u.createdAt DESC
    LIMIT page_limit OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Ban user procedure
CREATE OR REPLACE FUNCTION ban_user(
    user_id TEXT,
    ban_reason TEXT,
    ban_expires TIMESTAMP DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM "user" WHERE id = user_id) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'Utilisateur non trouvé avec l''ID: %', user_id;
    END IF;
    
    -- Ban the user
    UPDATE "user" 
    SET banned = true, 
        banReason = ban_reason, 
        banExpires = ban_expires,
        updatedAt = NOW()
    WHERE id = user_id;
    
    -- Invalidate all user sessions
    DELETE FROM "session" WHERE userId = user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Unban user procedure
CREATE OR REPLACE FUNCTION unban_user(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM "user" WHERE id = user_id) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'Utilisateur non trouvé avec l''ID: %', user_id;
    END IF;
    
    -- Unban the user
    UPDATE "user" 
    SET banned = false, 
        banReason = NULL, 
        banExpires = NULL,
        updatedAt = NOW()
    WHERE id = user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Update user role procedure
CREATE OR REPLACE FUNCTION update_user_role(
    user_id TEXT,
    new_role TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN;
    valid_roles TEXT[] := ARRAY['admin', 'user', 'member', 'guest'];
BEGIN
    -- Validate role
    IF new_role != ALL(valid_roles) THEN
        RAISE EXCEPTION 'Rôle invalide: %. Rôles valides: %', new_role, valid_roles;
    END IF;
    
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM "user" WHERE id = user_id) INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE EXCEPTION 'Utilisateur non trouvé avec l''ID: %', user_id;
    END IF;
    
    -- Update user role
    UPDATE "user" 
    SET role = new_role, updatedAt = NOW()
    WHERE id = user_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Delete user procedure (soft delete by banning permanently)
CREATE OR REPLACE FUNCTION delete_user(user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Ban permanently instead of hard delete to preserve referential integrity
    RETURN ban_user(user_id, 'Compte supprimé', NULL);
END;
$$ LANGUAGE plpgsql;