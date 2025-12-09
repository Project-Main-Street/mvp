-- Create business_products join table for many-to-many relationship
CREATE TABLE IF NOT EXISTS business_products (
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (business_id, product_id)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS business_products_business_idx ON business_products (business_id);
CREATE INDEX IF NOT EXISTS business_products_product_idx ON business_products (product_id);

-- Remove business_id column from products table since products are now only references
ALTER TABLE products DROP COLUMN IF EXISTS business_id;
