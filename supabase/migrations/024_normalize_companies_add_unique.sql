-- Normalize company names (trim, collapse spaces, title case via initcap) and create unique index on lower(trim(name))
-- WARNING: Run after deduplication has been performed.

BEGIN;

-- Normalize existing names: trim whitespace and collapse multiple spaces
UPDATE companies
SET name = initcap(trim(regexp_replace(name, '\\s+', ' ', 'g')))
WHERE name IS NOT NULL;

-- Create unique index on normalized name (lowercase trim) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS companies_unique_normalized_name ON companies ((lower(trim(name))));

COMMIT;
