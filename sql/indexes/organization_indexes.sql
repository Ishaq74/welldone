-- Indexes for organization-related tables

-- Organization table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_slug 
ON "organization" (slug);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_name 
ON "organization" (LOWER(name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_created_at 
ON "organization" (createdAt);

-- Member table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_member_organization_id 
ON "member" (organizationId);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_member_user_id 
ON "member" (userId);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_member_role 
ON "member" (role);

-- Composite index for organization members by role
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_member_org_role 
ON "member" (organizationId, role);

-- Unique composite index to prevent duplicate memberships
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_member_user_org_unique 
ON "member" (userId, organizationId);

-- Invitation table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitation_organization_id 
ON "invitation" (organizationId);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitation_email 
ON "invitation" (LOWER(email));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitation_status 
ON "invitation" (status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitation_expires_at 
ON "invitation" (expiresAt);

-- Index for pending invitations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invitation_pending 
ON "invitation" (id) WHERE status = 'pending' AND expiresAt > NOW();