-- Migration to refactor custom_death_date to life_expectancy
-- Purpose: Switch from a hardcoded death date to a dynamic life expectancy (integer age).
-- Default: 85 years.

-- 1. Rename the column
ALTER TABLE profiles 
RENAME COLUMN custom_death_date TO life_expectancy;

-- 2. Change the type from DATE/TIMESTAMP to INTEGER
-- Note: usage of USING '85'::integer is a destructive simplification. 
-- Ideally we would calculate existing age difference, but for early stage dev, resetting to default is acceptable.
ALTER TABLE profiles 
ALTER COLUMN life_expectancy TYPE integer 
USING 85;

-- 3. Set Default Constraint
ALTER TABLE profiles 
ALTER COLUMN life_expectancy SET DEFAULT 85;

-- 4. Update comment
COMMENT ON COLUMN profiles.life_expectancy IS 'Expected age of death for financial projections (default 85).';
