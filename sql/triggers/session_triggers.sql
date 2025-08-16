-- Triggers for session management

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM "session" 
    WHERE expiresAt <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to limit concurrent sessions per user
CREATE OR REPLACE FUNCTION limit_user_sessions()
RETURNS TRIGGER AS $$
DECLARE
    session_count INTEGER;
    max_sessions INTEGER := 10; -- Limit to 10 concurrent sessions per user
BEGIN
    -- Count current active sessions for this user
    SELECT COUNT(*) INTO session_count
    FROM "session" 
    WHERE userId = NEW.userId AND expiresAt > NOW();
    
    -- If user has too many sessions, delete the oldest ones
    IF session_count >= max_sessions THEN
        DELETE FROM "session" 
        WHERE userId = NEW.userId 
        AND id IN (
            SELECT id FROM "session" 
            WHERE userId = NEW.userId 
            ORDER BY createdAt ASC 
            LIMIT (session_count - max_sessions + 1)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to limit concurrent sessions
DROP TRIGGER IF EXISTS trigger_limit_sessions ON "session";
CREATE TRIGGER trigger_limit_sessions
    BEFORE INSERT ON "session"
    FOR EACH ROW
    EXECUTE FUNCTION limit_user_sessions();

-- Function to log session activity
CREATE OR REPLACE FUNCTION log_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Log session creation/deletion for security audit
    -- This could be extended to write to a separate audit table
    IF TG_OP = 'INSERT' THEN
        RAISE LOG 'Session created for user % from IP %', NEW.userId, NEW.ipAddress;
    ELSIF TG_OP = 'DELETE' THEN
        RAISE LOG 'Session deleted for user % (token: %)', OLD.userId, LEFT(OLD.token, 8);
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log session activity
DROP TRIGGER IF EXISTS trigger_log_session_activity ON "session";
CREATE TRIGGER trigger_log_session_activity
    AFTER INSERT OR DELETE ON "session"
    FOR EACH ROW
    EXECUTE FUNCTION log_session_activity();