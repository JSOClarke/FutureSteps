-- Create financial_snapshots table for storing historical financial snapshots
CREATE TABLE IF NOT EXISTS financial_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Snapshot financial data
    total_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_expenses DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_assets DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_liabilities DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_worth DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Item counts for reference
    income_count INTEGER DEFAULT 0,
    expense_count INTEGER DEFAULT 0,
    asset_count INTEGER DEFAULT 0,
    liability_count INTEGER DEFAULT 0,
    
    -- Optional user note
    note TEXT
);

-- Create index for efficient querying by user and date
CREATE INDEX IF NOT EXISTS idx_snapshots_user_date ON financial_snapshots(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE financial_snapshots ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own snapshots
CREATE POLICY "Users can view own snapshots"
    ON financial_snapshots FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own snapshots
CREATE POLICY "Users can create own snapshots"
    ON financial_snapshots FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own snapshots
CREATE POLICY "Users can delete own snapshots"
    ON financial_snapshots FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE financial_snapshots IS 'Stores historical snapshots of user financial data for tracking over time';
COMMENT ON COLUMN financial_snapshots.net_worth IS 'Calculated as: total_assets - total_liabilities';
