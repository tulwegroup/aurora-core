-- Aurora Core Database Schema
-- Phase 12 Production Database Initialization

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    coordinates JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commodities table
CREATE TABLE IF NOT EXISTS commodities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    symbol VARCHAR(10),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scans table
CREATE TABLE IF NOT EXISTS scans (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id),
    status VARCHAR(20) DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Discoveries table
CREATE TABLE IF NOT EXISTS discoveries (
    id SERIAL PRIMARY KEY,
    scan_id INTEGER REFERENCES scans(id),
    commodity_id INTEGER REFERENCES commodities(id),
    probability DECIMAL(3,2) CHECK (probability >= 0 AND probability <= 1),
    coordinates JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default regions
INSERT INTO regions (id, name, country, coordinates) VALUES 
(1, 'Antofagasta', 'Chile', '{"lat": -23.6, "lng": -70.4}'),
(2, 'Pilbara', 'Australia', '{"lat": -21.3, "lng": 119.1}'),
(3, 'Salton Sea', 'USA', '{"lat": 33.3, "lng": -115.8}'),
(4, 'Katanga', 'Congo', '{"lat": -11.6, "lng": 27.5}'),
(5, 'Quebec', 'Canada', '{"lat": 52.9, "lng": -73.1}')
ON CONFLICT (id) DO NOTHING;

-- Insert default commodities
INSERT INTO commodities (name, symbol, category) VALUES 
('Copper', 'CU', 'Base Metal'),
('Lithium', 'LI', 'Battery Metal'),
('Gold', 'AU', 'Precious Metal'),
('Silver', 'AG', 'Precious Metal'),
('Nickel', 'NI', 'Base Metal'),
('Cobalt', 'CO', 'Battery Metal'),
('Platinum', 'PT', 'Precious Metal'),
('Palladium', 'PD', 'Precious Metal'),
('Uranium', 'U', 'Nuclear'),
('REE', 'REE', 'Rare Earth'),
('Hydrogen', 'H2', 'Energy'),
('Helium', 'HE', 'Industrial Gas'),
('Phosphate', 'P', 'Fertilizer'),
('Potash', 'K', 'Fertilizer'),
('Borates', 'B', 'Industrial'),
('Tin', 'SN', 'Base Metal'),
('Tungsten', 'W', 'Industrial'),
('Manganese', 'MN', 'Industrial'),
('Graphite', 'C', 'Battery Material'),
('Diamond', 'DI', 'Gem'),
('Emerald', 'EM', 'Gem'),
('Ruby', 'RU', 'Gem'),
('Sapphire', 'SA', 'Gem')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discoveries_scan_id ON discoveries(scan_id);
CREATE INDEX IF NOT EXISTS idx_discoveries_commodity_id ON discoveries(commodity_id);
CREATE INDEX IF NOT EXISTS idx_discoveries_probability ON discoveries(probability);
CREATE INDEX IF NOT EXISTS idx_scans_region_id ON scans(region_id);
CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);

-- Create view for active discoveries
CREATE OR REPLACE VIEW active_discoveries AS
SELECT 
    d.id,
    d.probability,
    d.coordinates,
    d.metadata,
    c.name as commodity_name,
    r.name as region_name,
    r.country as region_country,
    s.completed_at as discovery_date
FROM discoveries d
JOIN commodities c ON d.commodity_id = c.id
JOIN scans s ON d.scan_id = s.id
JOIN regions r ON s.region_id = r.id
WHERE s.status = 'completed' AND d.probability >= 0.5
ORDER BY d.probability DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO aurora_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO aurora_user;