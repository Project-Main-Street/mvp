-- Remove the old products TEXT column from businesses table
-- Now using a proper one-to-many relationship with products table
ALTER TABLE businesses 
DROP COLUMN IF EXISTS products;
