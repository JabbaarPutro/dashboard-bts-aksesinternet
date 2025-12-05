-- PostgreSQL schema for dashboard BTS and Akses Internet
-- Converted from MySQL to PostgreSQL

-- Create ENUM types for status fields
CREATE TYPE bts_status AS ENUM ('On Air', 'Dalam Pembangunan');
CREATE TYPE akses_internet_status AS ENUM ('Aktif', 'Dalam Instalasi');

-- Table structure for table "bts"
CREATE TABLE bts (
  id SERIAL PRIMARY KEY,
  nama_situs VARCHAR(255) NOT NULL,
  provinsi VARCHAR(100) NOT NULL,
  kabupaten VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status bts_status NOT NULL,
  jaringan VARCHAR(10) NOT NULL,
  jenis_layanan VARCHAR(50) NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table structure for table "akses_internet"
CREATE TABLE akses_internet (
  id SERIAL PRIMARY KEY,
  nama_lokasi VARCHAR(255) NOT NULL,
  provinsi VARCHAR(100) NOT NULL,
  kabupaten VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status akses_internet_status NOT NULL,
  jenis_layanan VARCHAR(50) NOT NULL,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_bts_provinsi ON bts(provinsi);
CREATE INDEX idx_bts_kabupaten ON bts(kabupaten);
CREATE INDEX idx_bts_status ON bts(status);
CREATE INDEX idx_akses_internet_provinsi ON akses_internet(provinsi);
CREATE INDEX idx_akses_internet_kabupaten ON akses_internet(kabupaten);
CREATE INDEX idx_akses_internet_status ON akses_internet(status);

-- Optional: Create trigger to auto-update last_updated field
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bts_last_updated BEFORE UPDATE ON bts
FOR EACH ROW EXECUTE FUNCTION update_last_updated_column();

CREATE TRIGGER update_akses_internet_last_updated BEFORE UPDATE ON akses_internet
FOR EACH ROW EXECUTE FUNCTION update_last_updated_column();
