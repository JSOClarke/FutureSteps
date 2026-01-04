-- Add yield_rate_type column to financial_items table
ALTER TABLE financial_items 
ADD COLUMN IF NOT EXISTS yield_rate_type TEXT CHECK (yield_rate_type IN ('nominal', 'aer')) DEFAULT 'nominal';

COMMENT ON COLUMN financial_items.yield_rate_type IS 'Type of yield rate: nominal (APR) or aer (APY)';
