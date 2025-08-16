-- Triggers for user table to handle business logic

-- Function to handle user ban expiration
CREATE OR REPLACE FUNCTION handle_ban_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- If ban is being set and banExpires is in the past or null, set it to indefinite
    IF NEW.banned = true AND (NEW.banExpires IS NULL OR NEW.banExpires <= NOW()) THEN
        NEW.banExpires := NULL; -- Permanent ban
    END IF;
    
    -- If ban is being removed, clear ban reason and expiration
    IF NEW.banned = false THEN
        NEW.banReason := NULL;
        NEW.banExpires := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle ban logic
DROP TRIGGER IF EXISTS trigger_ban_expiration ON "user";
CREATE TRIGGER trigger_ban_expiration
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    WHEN (OLD.banned IS DISTINCT FROM NEW.banned OR OLD.banExpires IS DISTINCT FROM NEW.banExpires)
    EXECUTE FUNCTION handle_ban_expiration();

-- Function to automatically unban users when ban expires
CREATE OR REPLACE FUNCTION auto_unban_expired_users()
RETURNS void AS $$
BEGIN
    UPDATE "user" 
    SET banned = false, banReason = NULL, banExpires = NULL, updatedAt = NOW()
    WHERE banned = true 
      AND banExpires IS NOT NULL 
      AND banExpires <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to validate email format
CREATE OR REPLACE FUNCTION validate_email_format()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Format d''email invalide: %', NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate email format
DROP TRIGGER IF EXISTS trigger_validate_email ON "user";
CREATE TRIGGER trigger_validate_email
    BEFORE INSERT OR UPDATE ON "user"
    FOR EACH ROW
    WHEN (NEW.email IS NOT NULL)
    EXECUTE FUNCTION validate_email_format();

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updatedAt
DROP TRIGGER IF EXISTS trigger_user_updated_at ON "user";
CREATE TRIGGER trigger_user_updated_at
    BEFORE UPDATE ON "user"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();