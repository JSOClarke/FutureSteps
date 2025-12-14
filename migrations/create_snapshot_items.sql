-- Create snapshot_items table for storing individual items within each snapshot
CREATE TABLE IF NOT EXISTS snapshot_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_id UUID REFERENCES financial_snapshots(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Item details
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('income', 'expenses', 'assets', 'liabilities'))
);

-- Create index for efficient querying by snapshot
CREATE INDEX IF NOT EXISTS idx_snapshot_items_snapshot_id ON snapshot_items(snapshot_id);

-- Enable Row Level Security
ALTER TABLE snapshot_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view items from their own snapshots
CREATE POLICY "Users can view own snapshot items"
    ON snapshot_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM financial_snapshots
            WHERE financial_snapshots.id = snapshot_items.snapshot_id
            AND financial_snapshots.user_id = auth.uid()
        )
    );

-- Policy: Users can insert items for their own snapshots
CREATE POLICY "Users can create own snapshot items"
    ON snapshot_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM financial_snapshots
            WHERE financial_snapshots.id = snapshot_items.snapshot_id
            AND financial_snapshots.user_id = auth.uid()
        )
    );

-- Policy: Users can delete items from their own snapshots
CREATE POLICY "Users can delete own snapshot items"
    ON snapshot_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM financial_snapshots
            WHERE financial_snapshots.id = snapshot_items.snapshot_id
            AND financial_snapshots.user_id = auth.uid()
        )
    );

-- Add comment for documentation
COMMENT ON TABLE snapshot_items IS 'Stores individual financial items for each snapshot, allowing historical item-level tracking';
