-- Try updating via auth.instances raw_base_config
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'auth' AND table_name = 'instances'
  ) THEN
    UPDATE auth.instances
    SET raw_base_config = COALESCE(raw_base_config::jsonb, '{}'::jsonb)
      || '{"GOTRUE_PASSWORD_HIBP_ENABLED": "true"}'::jsonb;
  END IF;
END;
$$;
