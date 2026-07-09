
-- Normalize all existing emails to lowercase in both tables
UPDATE registrations SET email = lower(email) WHERE email != lower(email);
UPDATE join_requests  SET email = lower(email) WHERE email != lower(email);

-- Trigger function: lowercase email on every INSERT
CREATE OR REPLACE FUNCTION normalize_email_on_insert()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.email := lower(NEW.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_registrations_normalize_email
  BEFORE INSERT ON registrations
  FOR EACH ROW EXECUTE FUNCTION normalize_email_on_insert();

CREATE OR REPLACE TRIGGER trg_join_requests_normalize_email
  BEFORE INSERT ON join_requests
  FOR EACH ROW EXECUTE FUNCTION normalize_email_on_insert();
