-- Indexes for the user table to optimize queries
-- Better Auth creates basic indexes, but these are additional optimizations

-- Index for email lookups (case-insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email_lower 
ON "user" (LOWER(email));

-- Index for username lookups (case-insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_username_lower 
ON "user" (LOWER(username));

-- Index for role-based queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_role 
ON "user" (role);

-- Index for banned users
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_banned 
ON "user" (banned) WHERE banned = true;

-- Index for ban expiration lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_ban_expires 
ON "user" (banExpires) WHERE banExpires IS NOT NULL;

-- Composite index for active users (not banned or ban expired)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_active 
ON "user" (id) WHERE banned = false OR banExpires < NOW();

-- Index for created date for user statistics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_created_at 
ON "user" (createdAt);

-- Index for email verification status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_email_verified 
ON "user" (emailVerified);