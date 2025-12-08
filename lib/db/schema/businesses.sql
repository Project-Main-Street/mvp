-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT, -- ZIP code
    category TEXT, -- Will be FK to categories table when implemented
    employee_count_range_id INTEGER REFERENCES employee_count_ranges(id) ON DELETE SET NULL,
    revenue_range_id INTEGER REFERENCES revenue_ranges(id) ON DELETE SET NULL,
    products TEXT, -- Will be FK to products table when implemented
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS businesses_name_idx ON businesses (name);
CREATE INDEX IF NOT EXISTS businesses_location_idx ON businesses (location);
CREATE INDEX IF NOT EXISTS businesses_category_idx ON businesses (category);
-- Note: Indexes for employee_count_range_id and revenue_range_id are created in alter_businesses.sql

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS businesses_updated_at ON businesses;
CREATE TRIGGER businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_businesses_updated_at();
