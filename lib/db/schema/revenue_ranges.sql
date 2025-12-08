-- Revenue ranges lookup table
CREATE TABLE IF NOT EXISTS revenue_ranges (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    min_revenue INTEGER,
    max_revenue INTEGER,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert standard revenue ranges (in USD)
INSERT INTO revenue_ranges (label, min_revenue, max_revenue, display_order)
VALUES 
    ('Under $100K', 0, 100000, 1),
    ('$100K - $500K', 100000, 500000, 2),
    ('$500K - $1M', 500000, 1000000, 3),
    ('$1M - $5M', 1000000, 5000000, 4),
    ('$5M - $10M', 5000000, 10000000, 5),
    ('$10M - $50M', 10000000, 50000000, 6),
    ('$50M+', 50000000, NULL, 7)
ON CONFLICT (label) DO NOTHING;
