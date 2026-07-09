-- Probe: check which auth config tables exist
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'auth'
ORDER BY table_name;
