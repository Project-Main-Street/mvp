-- Migration: Update businesses table to use range foreign keys
-- This script alters the existing businesses table to use FK references instead of min/max columns

-- Add new columns for range FKs
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS employee_count_range_id INTEGER REFERENCES employee_count_ranges(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS revenue_range_id INTEGER REFERENCES revenue_ranges(id) ON DELETE SET NULL;

-- Drop old columns if they exist
ALTER TABLE businesses 
DROP COLUMN IF EXISTS employees_count_min,
DROP COLUMN IF EXISTS employees_count_max,
DROP COLUMN IF EXISTS annual_revenue_min,
DROP COLUMN IF EXISTS annual_revenue_max;

-- Add indexes for the new FK columns
CREATE INDEX IF NOT EXISTS businesses_employee_count_range_idx ON businesses (employee_count_range_id);
CREATE INDEX IF NOT EXISTS businesses_revenue_range_idx ON businesses (revenue_range_id);
