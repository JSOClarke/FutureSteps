-- Add start_month and end_month to financial_items table
-- Default start_month to 1 (January) and end_month to 12 (December) for existing records

ALTER TABLE financial_items 
ADD COLUMN start_month INTEGER DEFAULT 1,
ADD COLUMN end_month INTEGER DEFAULT 12;

-- Optional: Add check constraints to ensure valid months (1-12)
ALTER TABLE financial_items
ADD CONSTRAINT check_start_month_range CHECK (start_month >= 1 AND start_month <= 12),
ADD CONSTRAINT check_end_month_range CHECK (end_month >= 1 AND end_month <= 12);
