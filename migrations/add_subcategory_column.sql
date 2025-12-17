-- Add sub_category column to financial_items table
ALTER TABLE financial_items 
ADD COLUMN sub_category TEXT;

-- Optional: Create an index for better filtering performance if needed
-- CREATE INDEX idx_financial_items_sub_category ON financial_items(sub_category);
