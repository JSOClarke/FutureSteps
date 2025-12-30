-- Add sub_category column to snapshot_items table
ALTER TABLE snapshot_items 
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100);

-- Add comment
COMMENT ON COLUMN snapshot_items.sub_category IS 'Sub-category for aggregation (e.g., cash, investments_stock, real_estate)';
