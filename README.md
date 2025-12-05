# Dashboard BTS & Akses Internet

Dashboard untuk visualisasi sebaran BTS dan Akses Internet di Indonesia dengan peta interaktif.

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS, Vite
- **Map**: Leaflet.js with marker clustering
- **Backend**: Node.js Serverless Functions
- **Database**: Neon PostgreSQL (Serverless)
- **Deployment**: Vercel

## Features
- 🗺️ Interactive map visualization with province-level data
- 📊 Real-time statistics and filtering
- 🔄 Dynamic switching between BTS and Internet Access views
- 📱 Responsive design for mobile and desktop
- 🎯 Multiple filters (Status, Network Type, Service Type)

## Prerequisites
- Node.js 18 or higher
- npm or yarn
- Neon PostgreSQL account (free tier available)
- Vercel account (optional, for deployment)

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/JabbaarPutro/dashboard-bts-aksesinternet.git
cd dashboard-bts-aksesinternet
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Neon PostgreSQL Database

#### Create Neon Database
1. Sign up at [Neon](https://neon.tech) (free tier available)
2. Create a new project
3. Copy your connection string from the dashboard

#### Import Schema and Data
1. Run the schema creation script:
```bash
# Connect to your Neon database using psql or their SQL Editor
# Then run the contents of database/schema.sql
```

2. Import your data from the original MySQL database:
```bash
# Use the Neon SQL Editor or psql to insert your data
# Refer to db_bts_aksesinternet_dashboard.sql for the data
# Note: Adjust INSERT statements for PostgreSQL syntax if needed
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Edit `.env` and add your Neon connection string:
```env
DATABASE_URL=postgresql://user:password@your-project.neon.tech/dbname?sslmode=require
```

### 5. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Building for Production

Build the project:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Deploy via Vercel Dashboard
1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variable `DATABASE_URL` in Vercel project settings
4. Deploy!

### Environment Variables in Vercel
Add the following environment variable in your Vercel project settings:
- `DATABASE_URL`: Your Neon PostgreSQL connection string

## Project Structure
```
dashboard-bts-aksesinternet/
├── api/                          # Serverless API functions
│   └── data.js                   # Main API endpoint for BTS and Internet data
├── database/                     # Database schema
│   └── schema.sql                # PostgreSQL schema
├── public/                       # Static public assets
│   └── IndonesiaProvinsi.geojson # Indonesia provinces GeoJSON data
├── src/                          # Source files
│   ├── assets/                   # Images and icons
│   │   └── logo_bakti_komdigi.png
│   ├── bts.js                    # BTS dashboard logic
│   ├── internet.js               # Internet access dashboard logic
│   ├── main.js                   # Main application logic
│   └── style.css                 # Custom styles
├── index.html                    # Main HTML file
├── package.json                  # NPM dependencies and scripts
├── vite.config.js                # Vite configuration
├── vercel.json                   # Vercel deployment configuration
└── README.md                     # This file
```

## API Endpoints

### GET /api/data
Fetch BTS or Internet Access data

**Query Parameters:**
- `type`: `bts` or `internet` (default: `bts`)

**Response:**
```json
{
  "pointData": [...],        // Array of location points
  "provinceData": {...},     // Aggregated province statistics
  "lastUpdated": "...",      // Last update timestamp
  "filters": {...}           // Available filter options
}
```

## Database Schema

### BTS Table
- `id`: Serial primary key
- `nama_situs`: Site name (VARCHAR 255)
- `provinsi`: Province name (VARCHAR 100)
- `kabupaten`: Regency name (VARCHAR 100)
- `latitude`: Latitude coordinate (DOUBLE PRECISION)
- `longitude`: Longitude coordinate (DOUBLE PRECISION)
- `status`: Status ('On Air' or 'Dalam Pembangunan')
- `jaringan`: Network type (VARCHAR 10)
- `jenis_layanan`: Service type (VARCHAR 50)
- `last_updated`: Last update timestamp

### Akses Internet Table
- `id`: Serial primary key
- `nama_lokasi`: Location name (VARCHAR 255)
- `provinsi`: Province name (VARCHAR 100)
- `kabupaten`: Regency name (VARCHAR 100)
- `latitude`: Latitude coordinate (DOUBLE PRECISION)
- `longitude`: Longitude coordinate (DOUBLE PRECISION)
- `status`: Status ('Aktif' or 'Dalam Instalasi')
- `jenis_layanan`: Service type (VARCHAR 50)
- `last_updated`: Last update timestamp

## Migration from PHP + MySQL

This project has been migrated from PHP + MySQL to Vite + Node.js + Neon PostgreSQL:
- ✅ Backend API converted from PHP to Node.js serverless functions
- ✅ Database migrated from MySQL to PostgreSQL
- ✅ Frontend updated to use Vite build system
- ✅ Ready for deployment to Vercel

### Key Changes
1. **API Endpoint**: Changed from `api.php?type=bts` to `/api/data?type=bts`
2. **Database**: MySQL queries converted to PostgreSQL syntax
3. **Build System**: Using Vite instead of plain HTML/JS
4. **Deployment**: Optimized for Vercel instead of Railway

## Troubleshooting

### API Returns 500 Error
- Check that `DATABASE_URL` environment variable is set correctly
- Verify your Neon database is accessible
- Check Vercel function logs for detailed error messages

### Map Not Loading
- Ensure `/IndonesiaProvinsi.geojson` is in the `public/` directory
- Check browser console for errors
- Verify Leaflet.js CDN is accessible

### Build Fails
- Clear `node_modules` and `dist` directories
- Run `npm install` again
- Check Node.js version (should be 18+)

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
ISC

## Credits
- Map data: Leaflet.js
- Tile provider: Stamen Toner Lite
- Database: Neon PostgreSQL
- Hosting: Vercel
