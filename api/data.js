import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get database connection string from environment variable
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return res.status(500).json({ error: 'DATABASE_URL environment variable not set' });
    }

    // Create database connection
    const sql = neon(databaseUrl);

    // Get type parameter from query string
    const { type = 'bts' } = req.query;

    let pointData = [];
    let provinceData = {};
    let filters = {};
    let lastUpdated = null;

    // Define queries and status mapping based on type
    let selectQuery, lastUpdatedQuery, statusMapping;

    if (type === 'bts') {
      selectQuery = `
        SELECT id, nama_situs as nama, provinsi, kabupaten, latitude, longitude, 
               status, jaringan, jenis_layanan 
        FROM bts
      `;
      lastUpdatedQuery = 'SELECT MAX(last_updated) as last_updated FROM bts';
      statusMapping = { 'On Air': 'onAir', 'Dalam Pembangunan': 'dalamPembangunan' };
    } else if (type === 'internet') {
      selectQuery = `
        SELECT id, nama_lokasi as nama, provinsi, kabupaten, latitude, longitude, 
               status, jenis_layanan 
        FROM akses_internet
      `;
      lastUpdatedQuery = 'SELECT MAX(last_updated) as last_updated FROM akses_internet';
      statusMapping = { 'Aktif': 'onAir', 'Dalam Instalasi': 'dalamPembangunan' };
    } else {
      return res.status(400).json({ error: 'Tipe data tidak valid.' });
    }

    // Get last updated timestamp
    const lastUpdatedResult = await sql(lastUpdatedQuery);
    if (lastUpdatedResult && lastUpdatedResult.length > 0) {
      const lastUpdatedTimestamp = lastUpdatedResult[0].last_updated;
      if (lastUpdatedTimestamp) {
        const date = new Date(lastUpdatedTimestamp);
        const bulan = [
          '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        lastUpdated = `${date.getDate()} ${bulan[date.getMonth() + 1]} ${date.getFullYear()}`;
      }
    }

    // Fetch data
    const results = await sql(selectQuery);

    const jaringanTypes = [];
    const layananTypes = [];

    // Process results
    if (results && results.length > 0) {
      results.forEach(row => {
        const point = {
          id: parseInt(row.id),
          nama_situs: row.nama,
          provinsi: row.provinsi,
          kabupaten: row.kabupaten,
          lat: parseFloat(row.latitude),
          lon: parseFloat(row.longitude),
          status: row.status,
        };

        if (type === 'bts') {
          point.jaringan = row.jaringan;
          point.jenis_layanan = row.jenis_layanan;
          if (row.jaringan && !jaringanTypes.includes(row.jaringan)) {
            jaringanTypes.push(row.jaringan);
          }
          if (row.jenis_layanan && !layananTypes.includes(row.jenis_layanan)) {
            layananTypes.push(row.jenis_layanan);
          }
        } else {
          point.jaringan = null;
          point.jenis_layanan = row.jenis_layanan;
          if (row.jenis_layanan && !layananTypes.includes(row.jenis_layanan)) {
            layananTypes.push(row.jenis_layanan);
          }
        }
        pointData.push(point);

        // Build province data
        const provinsi = row.provinsi;
        const kabupaten = row.kabupaten;
        const status = row.status;
        const statusKey = statusMapping[status] || 'lainnya';

        if (!provinceData[provinsi]) {
          provinceData[provinsi] = {
            total: 0,
            onAir: 0,
            dalamPembangunan: 0,
            regencies: {}
          };
        }
        if (!provinceData[provinsi].regencies[kabupaten]) {
          provinceData[provinsi].regencies[kabupaten] = {
            total: 0,
            onAir: 0,
            dalamPembangunan: 0
          };
        }

        provinceData[provinsi].total++;
        provinceData[provinsi].regencies[kabupaten].total++;

        if (provinceData[provinsi][statusKey] !== undefined) {
          provinceData[provinsi][statusKey]++;
          provinceData[provinsi].regencies[kabupaten][statusKey]++;
        }
      });
    }

    // Build filters
    if (type === 'bts') {
      jaringanTypes.sort();
      layananTypes.sort();
      filters.jaringan = jaringanTypes;
      filters.jenis_layanan = layananTypes;
    } else {
      layananTypes.sort();
      filters.jenis_layanan = layananTypes;
    }

    // Return response
    return res.status(200).json({
      pointData,
      provinceData,
      lastUpdated,
      filters
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      error: 'Koneksi database gagal: ' + error.message 
    });
  }
}
