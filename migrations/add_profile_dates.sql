-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS custom_death_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.date_of_birth IS 'User date of birth for calculating life expectancy';
COMMENT ON COLUMN profiles.custom_death_date IS 'Optional custom death date override';
