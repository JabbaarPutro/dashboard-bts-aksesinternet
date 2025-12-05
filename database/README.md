# Database Migration Guide

This guide helps you migrate data from the original MySQL database to Neon PostgreSQL.

## Prerequisites
- Access to the original MySQL database or the `db_bts_aksesinternet_dashboard.sql` file
- Neon PostgreSQL account with a created database
- psql command-line tool or access to Neon SQL Editor

## Step 1: Create Schema

1. Log in to your [Neon Console](https://console.neon.tech)
2. Navigate to your project
3. Open the SQL Editor
4. Run the contents of `schema.sql` to create tables and indexes

```sql
-- Copy and paste the entire contents of schema.sql
```

## Step 2: Export Data from MySQL

If you have access to the original MySQL database:

```bash
# Export BTS data
mysqldump -u username -p db_bts_aksesinternet_dashboard bts --no-create-info --complete-insert > bts_data.sql

# Export Akses Internet data
mysqldump -u username -p db_bts_aksesinternet_dashboard akses_internet --no-create-info --complete-insert > akses_internet_data.sql
```

## Step 3: Convert MySQL INSERT to PostgreSQL

MySQL and PostgreSQL have slight differences in INSERT syntax:

**MySQL:**
```sql
INSERT INTO `bts` VALUES (1, 'Site Name', 'Province', ...);
```

**PostgreSQL:**
```sql
INSERT INTO bts VALUES (1, 'Site Name', 'Province', ...);
-- or with explicit columns:
INSERT INTO bts (id, nama_situs, provinsi, ...) VALUES (1, 'Site Name', 'Province', ...);
```

### Quick Conversion:
```bash
# Remove backticks
sed "s/\`//g" bts_data.sql > bts_data_pg.sql
sed "s/\`//g" akses_internet_data.sql > akses_internet_data_pg.sql
```

## Step 4: Import Data to Neon PostgreSQL

### Option A: Using Neon SQL Editor
1. Open Neon SQL Editor
2. Copy the converted INSERT statements
3. Execute them in the SQL Editor

### Option B: Using psql
```bash
# Get your connection string from Neon dashboard
# Format: postgresql://[user]:[password]@[host]/[dbname]?sslmode=require

# Import BTS data
psql "postgresql://user:password@host.neon.tech/dbname?sslmode=require" -f bts_data_pg.sql

# Import Akses Internet data
psql "postgresql://user:password@host.neon.tech/dbname?sslmode=require" -f akses_internet_data_pg.sql
```

## Step 5: Verify Data

After importing, verify the data:

```sql
-- Check BTS count
SELECT COUNT(*) FROM bts;

-- Check Akses Internet count
SELECT COUNT(*) FROM akses_internet;

-- Check sample BTS data
SELECT * FROM bts LIMIT 5;

-- Check sample Akses Internet data
SELECT * FROM akses_internet LIMIT 5;

-- Verify provinces
SELECT DISTINCT provinsi FROM bts ORDER BY provinsi;
SELECT DISTINCT provinsi FROM akses_internet ORDER BY provinsi;
```

## Step 6: Reset Sequence (if needed)

If you're importing data with specific IDs, you may need to reset the sequence:

```sql
-- For BTS table
SELECT setval('bts_id_seq', (SELECT MAX(id) FROM bts));

-- For Akses Internet table
SELECT setval('akses_internet_id_seq', (SELECT MAX(id) FROM akses_internet));
```

## Alternative: Using the Original SQL File

If you prefer to use the original `db_bts_aksesinternet_dashboard.sql`:

1. Extract just the INSERT statements for both tables
2. Remove backticks and adjust for PostgreSQL syntax
3. Make sure ENUM values match the schema ('On Air' vs 'Aktif', etc.)
4. Import to Neon

## Common Issues

### Issue: ENUM type mismatch
**Error:** `invalid input value for enum bts_status: "..."`

**Solution:** Make sure status values match exactly:
- BTS: 'On Air' or 'Dalam Pembangunan'
- Akses Internet: 'Aktif' or 'Dalam Instalasi'

### Issue: Timestamp format
**Error:** `invalid input syntax for type timestamp`

**Solution:** PostgreSQL accepts most timestamp formats. If issues occur:
```sql
-- Use explicit timestamp casting
INSERT INTO bts (..., last_updated) VALUES (..., '2025-09-04 05:42:45'::timestamp);
```

### Issue: Connection timeout
**Solution:** 
- Check your Neon project is not suspended (free tier)
- Verify connection string includes `?sslmode=require`
- Try breaking large INSERT statements into smaller batches

## Testing the API

After data migration, test the API locally:

1. Set up `.env` file with your Neon connection string:
```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

2. The API endpoint will be available at `/api/data?type=bts` or `/api/data?type=internet`

## Need Help?

If you encounter issues:
1. Check Neon's documentation: https://neon.tech/docs
2. Verify your connection string
3. Check the Neon console logs for errors
4. Ensure your IP is not blocked (Neon free tier is accessible from anywhere by default)
