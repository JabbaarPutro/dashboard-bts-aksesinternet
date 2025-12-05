# Quick Start Guide

Get your dashboard up and running in 5 minutes!

## 🚀 Fast Track to Production

### Step 1: Database Setup (2 minutes)
```bash
1. Sign up at https://neon.tech (free)
2. Create a new project
3. Copy your connection string
4. Run database/schema.sql in Neon SQL Editor
5. Import your data (see database/README.md for details)
```

### Step 2: Deploy to Vercel (2 minutes)
```bash
1. Push this code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Add environment variable:
   - Name: DATABASE_URL
   - Value: [your Neon connection string]
5. Click "Deploy"
```

### Step 3: Verify (1 minute)
```bash
1. Visit your Vercel deployment URL
2. Click "BTS" button - should show map with data
3. Click "Akses Internet" button - should show different data
4. Test filters and map interactions
```

**Done! Your dashboard is live! 🎉**

---

## 💻 Local Development Setup

### Prerequisites
- Node.js 18+ installed
- Git installed

### Quick Setup
```bash
# 1. Clone repository
git clone https://github.com/JabbaarPutro/dashboard-bts-aksesinternet.git
cd dashboard-bts-aksesinternet

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env and add your Neon connection string

# 4. Run development server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 📦 Available Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🔗 Important URLs

- **Documentation:**
  - [README.md](README.md) - Complete setup guide
  - [TESTING.md](TESTING.md) - Testing guide
  - [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment checklist
  - [database/README.md](database/README.md) - Database migration

- **Services:**
  - Neon Dashboard: https://console.neon.tech
  - Vercel Dashboard: https://vercel.com/dashboard

---

## 🆘 Common Issues

### Map not loading?
- Check browser console for errors
- Verify API returns data: `/api/data?type=bts`

### API errors?
- Verify `DATABASE_URL` is set correctly
- Check Neon database is not suspended
- Check Vercel function logs

### Build fails?
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Project Structure

```
dashboard-bts-aksesinternet/
├── api/                  # Serverless API functions
│   └── data.js          # Main API endpoint
├── database/            # Database files
│   ├── schema.sql       # PostgreSQL schema
│   └── README.md        # Migration guide
├── public/              # Static assets
│   └── IndonesiaProvinsi.geojson
├── src/                 # Source code
│   ├── assets/          # Images
│   ├── main.js          # Main application
│   ├── bts.js           # BTS dashboard
│   ├── internet.js      # Internet dashboard
│   └── style.css        # Styles
├── index.html           # Entry point
├── package.json         # Dependencies
├── vite.config.js       # Vite config
└── vercel.json          # Vercel config
```

---

## 🎯 Next Steps

After basic setup:
1. ✅ Read full [README.md](README.md) for detailed information
2. ✅ Import your actual data to database
3. ✅ Test all features (see [TESTING.md](TESTING.md))
4. ✅ Deploy to production (see [DEPLOYMENT.md](DEPLOYMENT.md))
5. ✅ Set up custom domain (optional)

---

## 💡 Tips

- **Always test locally** before deploying
- **Never commit `.env`** file
- **Use Vercel preview deployments** for testing
- **Monitor Vercel function logs** for errors
- **Keep dependencies updated**

---

## 📞 Need Help?

- Check detailed documentation in other markdown files
- Review Vercel deployment logs
- Check Neon database status
- Verify environment variables are set correctly

---

**Happy coding! 🚀**
