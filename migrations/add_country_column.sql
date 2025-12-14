-- Add missing country column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS country TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.country IS 'User country for currency and life expectancy calculations';
