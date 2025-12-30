-- Rename the column to reflect the new logic (Annual Cap)
ALTER TABLE financial_items 
RENAME COLUMN monthly_contribution TO max_annual_contribution;
