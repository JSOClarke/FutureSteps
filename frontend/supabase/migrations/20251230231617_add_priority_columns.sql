-- Add priority columns to plans table for storing surplus and deficit allocation order
ALTER TABLE plans 
ADD COLUMN IF NOT EXISTS surplus_priority TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deficit_priority TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN plans.surplus_priority IS 'Ordered list of asset IDs for surplus allocation priority';
COMMENT ON COLUMN plans.deficit_priority IS 'Ordered list of asset IDs for deficit coverage priority';
