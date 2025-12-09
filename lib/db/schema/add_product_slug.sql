-- Add slug column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION slugify(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Convert to lowercase, replace spaces and special chars with hyphens
    slug := lower(text_input);
    slug := regexp_replace(slug, '[^a-z0-9]+', '-', 'g');
    slug := regexp_replace(slug, '^-+|-+$', '', 'g'); -- Remove leading/trailing hyphens
    RETURN slug;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate unique slug with collision handling
CREATE OR REPLACE FUNCTION generate_unique_slug(product_name TEXT, product_id INTEGER DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 1;
    slug_exists BOOLEAN;
BEGIN
    base_slug := slugify(product_name);
    new_slug := base_slug;
    
    -- Check if base slug exists (excluding current product if updating)
    SELECT EXISTS (
        SELECT 1 FROM products 
        WHERE slug = new_slug 
        AND (product_id IS NULL OR id != product_id)
    ) INTO slug_exists;
    
    -- Only add counter if there's a collision
    IF slug_exists THEN
        LOOP
            new_slug := base_slug || '-' || counter;
            
            SELECT EXISTS (
                SELECT 1 FROM products 
                WHERE slug = new_slug 
                AND (product_id IS NULL OR id != product_id)
            ) INTO slug_exists;
            
            EXIT WHEN NOT slug_exists;
            
            counter := counter + 1;
        END LOOP;
    END IF;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_product_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if slug is NULL or empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_unique_slug(NEW.name, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS products_auto_slug ON products;

-- Create trigger for auto-generating slugs
CREATE TRIGGER products_auto_slug
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_product_slug();

-- Generate slugs for existing products that don't have one
UPDATE products
SET slug = generate_unique_slug(name, id)
WHERE slug IS NULL OR slug = '';

-- Now create unique index after slugs are populated
DROP INDEX IF EXISTS products_slug_idx;
CREATE UNIQUE INDEX products_slug_idx ON products (slug);
