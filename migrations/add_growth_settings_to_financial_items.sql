-- Add growth_mode and max_value columns to financial_items table
ALTER TABLE financial_items 
ADD COLUMN IF NOT EXISTS growth_mode TEXT CHECK (growth_mode IN ('none', 'inflation', 'percentage')),
ADD COLUMN IF NOT EXISTS max_value DECIMAL(15, 2);

-- Update comment
COMMENT ON COLUMN financial_items.growth_mode IS 'Growth strategy: none, inflation, or percentage';
COMMENT ON COLUMN financial_items.max_value IS 'Optional cap on the item value growth';
