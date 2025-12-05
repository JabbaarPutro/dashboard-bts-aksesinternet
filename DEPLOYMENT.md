# Deployment Checklist

Follow this checklist to successfully deploy your dashboard to Vercel with Neon PostgreSQL.

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Neon PostgreSQL account created
- [ ] New project created in Neon
- [ ] Database schema imported (from `database/schema.sql`)
- [ ] Data migrated from MySQL to PostgreSQL
- [ ] Data verified with sample queries
- [ ] Connection string copied from Neon dashboard

### 2. Local Testing
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with `DATABASE_URL`
- [ ] Local build successful (`npm run build`)
- [ ] No errors in build output
- [ ] Production preview works (`npm run preview`)

### 3. Repository
- [ ] All changes committed to Git
- [ ] Repository pushed to GitHub
- [ ] `.env` file is in `.gitignore` (never commit it!)
- [ ] No sensitive data in code

## Vercel Deployment

### Method 1: Vercel Dashboard (Recommended for First-Time)

#### Step 1: Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel should auto-detect the Vite configuration

#### Step 2: Configure Project
**Framework Preset:** Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### Step 3: Add Environment Variables
In the "Environment Variables" section, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://user:password@host.neon.tech/dbname?sslmode=require` |

**Important:** Make sure to add it to all environments (Production, Preview, Development)

#### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (usually 1-2 minutes)
3. Vercel will provide a deployment URL

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

When prompted:
- Set up and deploy? **Yes**
- Which scope? **Select your account**
- Link to existing project? **No** (first time) or **Yes** (subsequent deploys)
- What's your project's name? **dashboard-bts-aksesinternet**
- In which directory is your code located? **.**
- Override settings? **No** (uses vercel.json)

Add environment variable:
```bash
vercel env add DATABASE_URL
# Then paste your Neon connection string
# Select all environments (Production, Preview, Development)
```

## Post-Deployment Verification

### 1. Check Deployment Status
- [ ] Deployment shows as "Ready" in Vercel dashboard
- [ ] No build errors in deployment logs
- [ ] Domain is accessible

### 2. Test Application
Visit your deployment URL and verify:

**Frontend:**
- [ ] Page loads without errors
- [ ] Logo and images load correctly
- [ ] Map displays properly
- [ ] Both BTS and Internet Access buttons work
- [ ] Statistics cards show data

**Functionality:**
- [ ] BTS data loads when clicking BTS button
- [ ] Internet data loads when clicking Internet button
- [ ] Province tooltips show correct data
- [ ] Markers appear when zooming in
- [ ] Filters work correctly
- [ ] Last updated date displays

**API:**
Test API endpoints directly:
- [ ] `https://your-domain.vercel.app/api/data?type=bts` returns JSON
- [ ] `https://your-domain.vercel.app/api/data?type=internet` returns JSON
- [ ] No CORS errors in browser console

### 3. Check Vercel Logs
1. Go to Vercel Dashboard → Your Project
2. Click "Logs" tab
3. Trigger some API calls on your site
4. Verify:
   - [ ] No error messages
   - [ ] API functions execute successfully
   - [ ] Response times are reasonable (< 500ms)

### 4. Performance Check
Open Chrome DevTools:
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] Network requests complete successfully
- [ ] Page loads in < 3 seconds

## Troubleshooting

### Issue: Build Failed
**Check:**
- Vercel build logs for specific error
- `package.json` dependencies are correct
- No syntax errors in code

**Solution:**
```bash
# Test build locally first
npm run build
```

### Issue: API Returns 500 Error
**Check Vercel Function Logs:**
1. Dashboard → Project → Functions → api/data.js
2. Look for error messages

**Common causes:**
- `DATABASE_URL` not set or incorrect
- Neon database suspended (free tier)
- SQL syntax errors
- Connection timeout

**Solution:**
```bash
# Verify environment variable is set
vercel env ls

# Re-add if needed
vercel env add DATABASE_URL
```

### Issue: API Returns Empty Data
**Check:**
- Database has data imported
- SQL queries are correct for PostgreSQL
- No errors in Vercel function logs

**Solution:**
Test database connection directly:
```sql
-- In Neon SQL Editor
SELECT COUNT(*) FROM bts;
SELECT COUNT(*) FROM akses_internet;
```

### Issue: Map Not Loading
**Check:**
- Browser console for errors
- Network tab for failed requests
- GeoJSON file in `public/` directory

**Solution:**
Verify `IndonesiaProvinsi.geojson` is in the `public/` folder and gets copied to `dist/` during build.

### Issue: Images Not Loading
**Check:**
- Images are in `src/assets/` directory
- Paths in HTML use `/src/assets/...`
- Build output includes images

**Solution:**
```bash
# Rebuild and check dist/ directory
npm run build
ls -la dist/assets/
```

### Issue: CORS Errors
This shouldn't happen with Vercel, but if it does:

**Check:**
- API function sets CORS headers correctly
- Request is going to correct domain

**Solution:**
CORS headers are already set in `api/data.js`:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

## Custom Domain Setup (Optional)

### Add Custom Domain
1. Vercel Dashboard → Project → Settings → Domains
2. Add your domain name
3. Configure DNS records as instructed by Vercel
4. Wait for DNS propagation (can take up to 48 hours)

### SSL Certificate
- Vercel automatically provisions SSL certificates
- Your site will be available via HTTPS
- HTTP requests automatically redirect to HTTPS

## Environment Management

### Production Environment
- Used for your main deployment
- Accessed via your production domain
- Uses Production environment variables

### Preview Environment
- Created for each Git branch/PR
- Useful for testing before merging
- Uses Preview environment variables
- Automatically deleted when branch is deleted

### Development Environment
- Used when running `vercel dev` locally
- Uses Development environment variables

## Updating Deployment

### Push to Deploy
Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Redeploy
In Vercel Dashboard:
1. Go to Deployments
2. Click "..." on latest deployment
3. Select "Redeploy"

### Rollback
If something goes wrong:
1. Go to Deployments
2. Find a previous working deployment
3. Click "..." → "Promote to Production"

## Monitoring

### Check Analytics
Vercel Dashboard → Analytics:
- Page views
- Unique visitors
- Performance metrics
- Error rates

### Set Up Alerts
Vercel Dashboard → Settings → Notifications:
- Deployment notifications
- Error alerts
- Performance degradation alerts

## Best Practices

1. **Never commit `.env` file** - Always use Vercel environment variables
2. **Test locally first** - Run `npm run build` before deploying
3. **Use Preview deployments** - Test changes in preview before merging to main
4. **Monitor logs** - Check Vercel function logs regularly
5. **Keep dependencies updated** - Run `npm update` periodically
6. **Backup your database** - Neon provides automatic backups, but verify
7. **Use version tags** - Tag important releases in Git

## Scaling Considerations

### Free Tier Limits
- **Vercel Free:** 
  - 100 GB bandwidth/month
  - 100 GB-hrs function execution/month
  - 10s max function duration
  
- **Neon Free:**
  - 3 GB storage
  - 1 database
  - Inactive databases may suspend after 7 days

### Upgrade When Needed
Consider upgrading if you experience:
- High traffic (> 100k visitors/month)
- Function timeouts
- Database performance issues
- Need for more storage

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Neon Documentation:** https://neon.tech/docs
- **Vite Documentation:** https://vitejs.dev
- **GitHub Issues:** Report bugs in your repository

## Success Criteria

Your deployment is successful when:
- ✅ Site is accessible via Vercel URL
- ✅ Map loads and displays data
- ✅ Both BTS and Internet dashboards work
- ✅ API endpoints return data correctly
- ✅ No console errors
- ✅ Lighthouse score > 90
- ✅ Response times < 500ms
- ✅ Mobile responsive

## Next Steps

After successful deployment:
1. Share the URL with stakeholders
2. Monitor performance and errors
3. Gather user feedback
4. Plan feature enhancements
5. Set up custom domain (optional)
6. Configure monitoring and alerts

Congratulations! 🎉 Your dashboard is now live on Vercel with Neon PostgreSQL!
