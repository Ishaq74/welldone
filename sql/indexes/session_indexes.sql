-- Indexes for session table to optimize authentication queries

-- Index for session token lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_token 
ON "session" (token);

-- Index for user session lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_user_id 
ON "session" (userId);

-- Index for expired sessions cleanup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_expires_at 
ON "session" (expiresAt);

-- Index for active sessions (not expired)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_active 
ON "session" (id) WHERE expiresAt > NOW();

-- Index for IP address tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_ip_address 
ON "session" (ipAddress);

-- Index for user agent analysis
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_user_agent 
ON "session" (userAgent);

-- Index for organization-specific sessions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_session_active_org 
ON "session" (activeOrganizationId) WHERE activeOrganizationId IS NOT NULL;