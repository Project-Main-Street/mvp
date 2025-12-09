-- Product Categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert common product categories
INSERT INTO product_categories (name) VALUES
    ('Software'),
    ('Hardware'),
    ('Services'),
    ('Consulting'),
    ('Training'),
    ('Support'),
    ('Marketing'),
    ('Analytics'),
    ('Security'),
    ('Infrastructure')
ON CONFLICT (name) DO NOTHING;

-- Index for lookups
CREATE INDEX IF NOT EXISTS product_categories_name_idx ON product_categories (name);
