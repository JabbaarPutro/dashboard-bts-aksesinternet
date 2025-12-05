# Testing Guide

This document provides instructions for testing the dashboard application locally and in production.

## Prerequisites for Local Testing

1. **Node.js**: Version 18 or higher
2. **npm**: Comes with Node.js
3. **Neon PostgreSQL**: Database with schema and data imported
4. **Environment Variables**: `.env` file with `DATABASE_URL`

## Local Development Testing

### 1. Setup Environment

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env and add your Neon connection string
# DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### 2. Test Development Server

```bash
# Start development server
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
➜  press h to show help
```

**What to verify:**
- [ ] Server starts without errors
- [ ] Browser opens automatically to http://localhost:3000
- [ ] No console errors in terminal

### 3. Test Frontend

Open http://localhost:3000 in your browser.

**Visual Checks:**
- [ ] Logo loads correctly (BAKTI KOMDIGI)
- [ ] Map initializes and shows Indonesia
- [ ] Two toggle buttons visible: "BTS" and "Akses Internet"
- [ ] Three statistics cards visible (Total, Status 1, Status 2)
- [ ] Footer shows correct year

**Interaction Checks:**
- [ ] Click "BTS" button - should load BTS data
- [ ] Click "Akses Internet" button - should load Internet Access data
- [ ] Map provinces show different colors based on data density
- [ ] Hover over provinces shows tooltip with statistics
- [ ] Zoom in to level 6+ shows individual markers
- [ ] Click markers shows popup with location details

### 4. Test API Endpoints

Since Vite doesn't handle API routes in development, you'll need to test the API separately or deploy to Vercel for full testing.

**For API testing in development, you can use Vercel CLI:**

```bash
# Install Vercel CLI
npm install -g vercel

# Run in development mode (includes API routes)
vercel dev
```

Then test the API:

```bash
# Test BTS endpoint
curl http://localhost:3000/api/data?type=bts

# Test Internet endpoint
curl http://localhost:3000/api/data?type=internet
```

**Expected Response Structure:**
```json
{
  "pointData": [
    {
      "id": 1,
      "nama_situs": "...",
      "provinsi": "...",
      "kabupaten": "...",
      "lat": -2.1234,
      "lon": 106.1234,
      "status": "...",
      "jaringan": "...",
      "jenis_layanan": "..."
    }
  ],
  "provinceData": {
    "PROVINSI_NAME": {
      "total": 10,
      "onAir": 8,
      "dalamPembangunan": 2,
      "regencies": {}
    }
  },
  "lastUpdated": "4 September 2025",
  "filters": {
    "jaringan": ["2G", "3G", "4G"],
    "jenis_layanan": ["Voice", "Data"]
  }
}
```

### 5. Test Filters

**Status Filter:**
- [ ] Select "Semua Status" - shows all data
- [ ] Select specific status - filters map markers and updates stats
- [ ] Stats cards update correctly when filtering

**Network Filter (BTS only):**
- [ ] Click "Jaringan" dropdown
- [ ] Uncheck some options
- [ ] Map markers update
- [ ] "Pilih Semua" button works
- [ ] "Hapus Semua" button works

**Service Type Filter:**
- [ ] Click "Jenis Layanan" dropdown
- [ ] Uncheck some options
- [ ] Map markers and stats update correctly

### 6. Test Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

**What to verify:**
- [ ] Build completes without errors
- [ ] No warnings about missing files
- [ ] dist/ directory created
- [ ] Preview server runs successfully
- [ ] All features work in production build

### 7. Browser Compatibility Testing

Test in multiple browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

**Check for:**
- Proper rendering
- Map functionality
- Responsive layout on different screen sizes
- No console errors

### 8. Performance Testing

**Load Times:**
- [ ] Initial page load < 3 seconds
- [ ] API response < 2 seconds
- [ ] Map rendering smooth
- [ ] No lag when zooming/panning

**Network Tab (Browser DevTools):**
- [ ] All resources load successfully (200 status)
- [ ] No 404 errors
- [ ] GeoJSON file loads (~336 KB)
- [ ] Bundle size reasonable (~2 KB JS, ~4 KB CSS)

## Production Testing (Vercel)

### 1. Deploy to Vercel

```bash
# Using Vercel CLI
vercel --prod
```

Or via Vercel Dashboard:
1. Import repository
2. Add `DATABASE_URL` environment variable
3. Deploy

### 2. Test Production Deployment

**URL Tests:**
- [ ] Root URL loads correctly (https://your-project.vercel.app)
- [ ] API endpoint accessible (/api/data?type=bts)
- [ ] API endpoint accessible (/api/data?type=internet)
- [ ] Static assets load from Vercel CDN

**Functionality Tests:**
- [ ] All frontend features work
- [ ] Data loads from Neon PostgreSQL
- [ ] No CORS errors
- [ ] API responses are fast (< 500ms)

**Performance:**
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### 3. Database Connection Test

```bash
# Test API with curl
curl https://your-project.vercel.app/api/data?type=bts

# Check response
# Should return JSON with pointData, provinceData, etc.
```

### 4. Monitor Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Logs" tab
4. Trigger some API calls
5. Verify no errors in logs

## Automated Testing Checklist

### Frontend Tests
- [ ] Map initializes correctly
- [ ] Data fetching works
- [ ] Filters apply correctly
- [ ] UI components render properly
- [ ] Tooltips show correct data
- [ ] Switching between dashboards works

### API Tests
- [ ] /api/data?type=bts returns valid JSON
- [ ] /api/data?type=internet returns valid JSON
- [ ] Invalid type parameter returns error
- [ ] Response includes all required fields
- [ ] Data format matches expected structure

### Database Tests
- [ ] Connection to Neon successful
- [ ] Queries execute without errors
- [ ] Data returned matches expected format
- [ ] Last updated timestamp is correct

## Common Issues and Solutions

### Issue: Map not loading
**Check:**
- Browser console for errors
- Network tab for failed requests
- Leaflet.js CDN is accessible

### Issue: No data showing
**Check:**
- API endpoint returns data (check Network tab)
- Database has data imported
- `DATABASE_URL` environment variable is set
- Neon database is not suspended

### Issue: API returns 500 error
**Check:**
- Vercel function logs for error details
- Database connection string is correct
- Database contains required tables
- Query syntax is valid for PostgreSQL

### Issue: CORS errors
**Check:**
- API response includes CORS headers
- Request is going to correct domain
- No browser extensions blocking requests

### Issue: Markers not showing
**Check:**
- Zoom level (markers only show at zoom >= 6)
- Data has valid latitude/longitude
- Filter settings (some filters might hide all markers)

## Reporting Issues

If you find bugs:
1. Check browser console for errors
2. Check Vercel function logs
3. Verify database data is correct
4. Create an issue with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and version
   - Screenshots if applicable

## Performance Benchmarks

**Expected metrics:**
- Initial page load: < 2 seconds
- API response time: < 500ms
- Map render time: < 1 second
- Time to Interactive: < 3 seconds
- Lighthouse Performance: > 90
- Lighthouse Accessibility: > 95

## Security Testing

- [ ] Environment variables not exposed in client
- [ ] API rate limiting works (Vercel default limits)
- [ ] No SQL injection vulnerabilities (using parameterized queries)
- [ ] HTTPS enforced in production
- [ ] No sensitive data in error messages
