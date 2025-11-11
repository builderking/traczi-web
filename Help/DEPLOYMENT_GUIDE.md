# Traczi Deployment Guide

Complete guide for deploying the Traczi web application with billing integration.

## 🏗️ Architecture Overview

Your application has 3 components:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Billing Server  │────▶│ Traccar Server  │
│  (Frontend)     │     │   (Node.js)      │     │  api.traczi.com │
│  Port 3000      │     │   Port 4000      │     │                 │
└────────┬────────┘     └────────┬─────────┘     └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
    ┌────────────────────────────────┐
    │        Stripe API              │
    │  (Payment Processing)          │
    └────────────────────────────────┘
```

## 📦 Deployment Options

### Option 1: All-in-One Platform (Recommended for Beginners)

**Recommended: Render.com** (Free tier available)
- Easiest setup
- Automatic HTTPS
- Free tier for testing
- Automatic deployments from Git

### Option 2: Separate Services (Recommended for Production)

**Frontend:** Vercel / Netlify
**Backend:** Railway / Render / DigitalOcean
**Benefits:** Better scaling, CDN for frontend

### Option 3: VPS (Most Control)

**Provider:** DigitalOcean / AWS / Google Cloud
**Benefits:** Full control, cost-effective at scale

---

## 🚀 Quick Deployment (Render.com)

### Step 1: Prepare Your Repository

1. **Push code to GitHub:**
```bash
cd /Users/gauravpawar/Desktop/mobile_App/traczi-web
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy Billing Server

1. Go to **https://render.com** and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   ```
   Name: traczi-billing-server
   Environment: Node
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   Instance Type: Free
   ```

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=4000

   # Stripe
   STRIPE_SECRET_KEY=sk_live_your_live_key
   STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Stripe Price IDs (from your Stripe dashboard)
   STRIPE_PRICE_BASIC=price_xxx
   STRIPE_PRICE_MODERATE=price_xxx
   STRIPE_PRICE_ADVANCE=price_xxx

   # Traccar
   TRACCAR_BASE_URL=https://api.traczi.com
   TRACCAR_ADMIN_EMAIL=your_admin@email.com
   TRACCAR_ADMIN_PASSWORD=your_admin_password

   # Frontend URLs (update after deploying frontend)
   FRONTEND_URL=https://your-app.com
   SUCCESS_URL=https://your-app.com/registration-success
   CANCEL_URL=https://your-app.com/register

   # Security
   ALLOWED_ORIGINS=https://your-app.com
   ```

6. Click **"Create Web Service"**
7. **Copy the deployed URL** (e.g., `https://traczi-billing-server.onrender.com`)

### Step 3: Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   ```
   Name: traczi-web
   Build Command: npm run build
   Publish Directory: build
   ```

4. **Add Environment Variables:**
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   VITE_BILLING_API_URL=https://traczi-billing-server.onrender.com
   ```

5. Click **"Create Static Site"**
6. **Copy the deployed URL** (e.g., `https://traczi-web.onrender.com`)

### Step 4: Update Configuration

1. **Go back to billing server settings**
2. **Update environment variables:**
   ```
   FRONTEND_URL=https://traczi-web.onrender.com
   SUCCESS_URL=https://traczi-web.onrender.com/registration-success
   CANCEL_URL=https://traczi-web.onrender.com/register
   ALLOWED_ORIGINS=https://traczi-web.onrender.com
   ```

3. **Redeploy the billing server**

### Step 5: Configure Stripe Webhooks

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://traczi-billing-server.onrender.com/webhooks/stripe`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`

5. **Copy the Signing Secret**
6. **Update billing server environment:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_new_secret
   ```

7. **Test webhook:** Send test event from Stripe dashboard

---

## 🔧 Alternative: Deploy to Vercel + Railway

### Deploy Backend (Railway)

1. Go to **https://railway.app**
2. **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Configure:
   ```
   Root Directory: server
   Start Command: npm start
   ```
5. Add all environment variables (same as above)
6. Deploy and copy the URL

### Deploy Frontend (Vercel)

1. Go to **https://vercel.com**
2. **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   ```
   Framework Preset: Vite
   Build Command: npm run build
   Output Directory: build
   Root Directory: ./
   ```

5. **Environment Variables:**
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   VITE_BILLING_API_URL=https://your-railway-app.railway.app
   ```

6. Deploy

---

## 🌐 Custom Domain Setup

### For Frontend (Vercel/Render)

1. Go to your project settings
2. **Domains** → **Add Domain**
3. Enter: `app.traczi.com` or `traczi.com`
4. Add DNS records (provided by platform):
   ```
   Type: A
   Name: @
   Value: xxx.xxx.xxx.xxx

   Type: CNAME
   Name: www
   Value: your-app.vercel.app
   ```

### For Backend (Railway/Render)

1. Add domain: `api-billing.traczi.com`
2. Add DNS record:
   ```
   Type: CNAME
   Name: api-billing
   Value: your-backend.railway.app
   ```

---

## 🔐 Production Checklist

### Stripe Configuration

- [ ] Switch to **Live Mode** in Stripe Dashboard
- [ ] Use **Live API Keys** (pk_live_xxx, sk_live_xxx)
- [ ] Create **Production Price IDs**
- [ ] Configure **Production Webhook**
- [ ] Test payment flow end-to-end
- [ ] Enable **3D Secure** for card payments

### Security

- [ ] Use HTTPS for all URLs
- [ ] Set strong `TRACCAR_ADMIN_PASSWORD`
- [ ] Add all production domains to `ALLOWED_ORIGINS`
- [ ] Enable CORS properly
- [ ] Don't expose `.env` files
- [ ] Use environment variables for all secrets

### Frontend

- [ ] Update `vite.config.js` API proxy to production URL
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test device limits
- [ ] Test subscription page

### Backend

- [ ] Test all webhook events
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry)
- [ ] Configure log retention
- [ ] Test user creation
- [ ] Test password reset flow

---

## 📝 Environment Variables Reference

### Backend Server (.env)

```bash
# Server
PORT=4000
NODE_ENV=production

# Stripe (LIVE MODE)
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

# Stripe Prices (from Stripe dashboard)
STRIPE_PRICE_BASIC=price_xxxxx
STRIPE_PRICE_MODERATE=price_xxxxx
STRIPE_PRICE_ADVANCE=price_xxxxx

# Traccar
TRACCAR_BASE_URL=https://api.traczi.com
TRACCAR_ADMIN_EMAIL=admin@yourdomain.com
TRACCAR_ADMIN_PASSWORD=strong_password_here

# Frontend URLs
FRONTEND_URL=https://your-production-domain.com
SUCCESS_URL=https://your-production-domain.com/registration-success
CANCEL_URL=https://your-production-domain.com/register

# Security
ALLOWED_ORIGINS=https://your-production-domain.com,https://www.your-production-domain.com
```

### Frontend (.env)

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
VITE_BILLING_API_URL=https://your-backend-domain.com
```

---

## 🐛 Troubleshooting

### Issue: Stripe webhook fails

**Solution:**
1. Check webhook signature secret is correct
2. Ensure endpoint URL is accessible
3. Check server logs for errors
4. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to https://your-backend.com/webhooks/stripe
   ```

### Issue: CORS errors

**Solution:**
1. Add frontend URL to `ALLOWED_ORIGINS`
2. Restart backend server
3. Clear browser cache

### Issue: User creation fails

**Solution:**
1. Check `TRACCAR_ADMIN_EMAIL` and `TRACCAR_ADMIN_PASSWORD`
2. Test connection to Traccar API
3. Check Traccar server logs

### Issue: Device limit not working

**Solution:**
1. Check user's `deviceLimit` in Traccar
2. Verify device count API returns correct data
3. Check browser console for errors

---

## 📊 Monitoring

### Set up logging (Recommended)

1. **Sentry** for error tracking
2. **LogRocket** for session replay
3. **Stripe Dashboard** for payment monitoring
4. **Render/Railway logs** for server monitoring

### Health Check Endpoint

Add to `server/index.js`:
```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

---

## 🎯 Deployment Steps Summary

1. ✅ Push code to GitHub
2. ✅ Deploy backend to Render/Railway
3. ✅ Deploy frontend to Vercel/Netlify/Render
4. ✅ Configure Stripe webhook with production URL
5. ✅ Update environment variables
6. ✅ Test end-to-end registration flow
7. ✅ Set up custom domains (optional)
8. ✅ Monitor logs and test thoroughly

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Check browser console
3. Verify all environment variables
4. Test Stripe webhook with Stripe CLI
5. Review Traccar API responses

Good luck with your deployment! 🚀
