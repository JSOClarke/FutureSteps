-- Migration to add inflation adjustment toggle to financial items
-- Purpose: Allow users to specify which items grow with inflation.

ALTER TABLE financial_items 
ADD COLUMN is_adjusted_for_inflation BOOLEAN DEFAULT false;

COMMENT ON COLUMN financial_items.is_adjusted_for_inflation IS 'Whether this income/expense item should grow by the global inflation rate.';
