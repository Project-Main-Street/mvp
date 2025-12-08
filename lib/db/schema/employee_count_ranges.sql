-- Employee count ranges lookup table
CREATE TABLE IF NOT EXISTS employee_count_ranges (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    min_count INTEGER,
    max_count INTEGER,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Insert standard employee count ranges
INSERT INTO employee_count_ranges (label, min_count, max_count, display_order)
VALUES 
    ('1-10', 1, 10, 1),
    ('11-50', 11, 50, 2),
    ('51-200', 51, 200, 3),
    ('201-500', 201, 500, 4),
    ('501-1000', 501, 1000, 5),
    ('1000+', 1000, NULL, 6)
ON CONFLICT (label) DO NOTHING;
