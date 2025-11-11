# 🚀 Quick Deployment Guide

## Deploy in 15 Minutes

### Step 1: Prepare Stripe (5 min)

1. **Go to Stripe Dashboard** → Switch to **LIVE mode** (top right)
2. **Get API Keys:**
   - Go to Developers → API keys
   - Copy `Publishable key` (pk_live_xxx)
   - Copy `Secret key` (sk_live_xxx)

3. **Create Products:**
   - Go to Products → Create product
   - Create 3 products:
     - Basic Plan - $29.99/month
     - Moderate Plan - $69.99/month
     - Advanced Plan - $149.99/month
   - Copy each **Price ID** (price_xxx)

### Step 2: Deploy Backend (5 min)

**Using Render.com (Free):**

1. Go to **https://render.com** → Sign up with GitHub
2. **New** → **Web Service**
3. Connect GitHub repo: `your-username/traczi-web`
4. Settings:
   ```
   Name: traczi-billing
   Environment: Node
   Build Command: cd server && npm install
   Start Command: cd server && npm start
   ```

5. Add Environment Variables (click "Advanced"):
   ```env
   NODE_ENV=production
   PORT=4000
   STRIPE_SECRET_KEY=sk_live_xxx (from Step 1)
   STRIPE_PUBLISHABLE_KEY=pk_live_xxx (from Step 1)
   STRIPE_WEBHOOK_SECRET=whsec_xxx (we'll add this in Step 4)
   STRIPE_PRICE_BASIC=price_xxx (from Step 1)
   STRIPE_PRICE_MODERATE=price_xxx (from Step 1)
   STRIPE_PRICE_ADVANCE=price_xxx (from Step 1)
   TRACCAR_BASE_URL=https://api.traczi.com
   TRACCAR_ADMIN_EMAIL=your_admin@email.com
   TRACCAR_ADMIN_PASSWORD=your_password
   FRONTEND_URL=https://traczi-web.onrender.com (we'll update in Step 3)
   SUCCESS_URL=https://traczi-web.onrender.com/registration-success
   CANCEL_URL=https://traczi-web.onrender.com/register
   ALLOWED_ORIGINS=https://traczi-web.onrender.com
   ```

6. Click **"Create Web Service"**
7. **SAVE THIS URL:** `https://traczi-billing.onrender.com`

### Step 3: Deploy Frontend (3 min)

1. **New** → **Static Site**
2. Connect same GitHub repo
3. Settings:
   ```
   Name: traczi-web
   Build Command: npm run build
   Publish Directory: build
   ```

4. Environment Variables:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   VITE_BILLING_API_URL=https://traczi-billing.onrender.com
   ```

5. Click **"Create Static Site"**
6. **SAVE THIS URL:** `https://traczi-web.onrender.com`

7. **Go back to backend settings** and update:
   ```env
   FRONTEND_URL=https://traczi-web.onrender.com
   SUCCESS_URL=https://traczi-web.onrender.com/registration-success
   CANCEL_URL=https://traczi-web.onrender.com/register
   ALLOWED_ORIGINS=https://traczi-web.onrender.com
   ```

8. **Manual Deploy** → Redeploy

### Step 4: Configure Stripe Webhook (2 min)

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint:**
   ```
   Endpoint URL: https://traczi-billing.onrender.com/webhooks/stripe
   ```

3. **Select events to listen to:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`

4. **Copy Signing secret** (whsec_xxx)

5. **Update backend env var:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```

6. **Redeploy backend**

### Step 5: Test! (5 min)

1. Go to `https://traczi-web.onrender.com`
2. Register new account
3. Select a plan
4. Use Stripe test card:
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
   ZIP: Any 5 digits
   ```

5. Complete registration
6. Login with credentials shown
7. Go to Settings → Subscription
8. Add a device and verify limit works!

## ✅ You're Live!

Your app is now deployed and accepting payments!

### Next Steps:

- [ ] Add custom domain (Settings → Domains in Render)
- [ ] Switch Stripe to production cards
- [ ] Monitor webhook logs in Stripe Dashboard
- [ ] Set up Sentry for error tracking
- [ ] Add Google Analytics

### Important URLs:

- **Frontend:** https://traczi-web.onrender.com
- **Backend:** https://traczi-billing.onrender.com
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Render Dashboard:** https://dashboard.render.com

## 🐛 Troubleshooting

**Webhook not working?**
- Check webhook signing secret is correct
- Verify endpoint URL is correct
- Check backend logs in Render

**User not created?**
- Check Traccar admin credentials
- Verify TRACCAR_BASE_URL is correct
- Check backend logs

**Payment fails?**
- Verify Stripe is in LIVE mode
- Check price IDs are correct
- Look at Stripe Dashboard logs

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Render free tier sleeps after 15 min of inactivity
   - First request might be slow (cold start)
   - Upgrade to paid plan ($7/mo) for always-on

2. **Custom Domain:**
   - Buy domain from Namecheap/GoDaddy
   - Add in Render: Settings → Custom Domain
   - Point DNS records as instructed

3. **Monitoring:**
   - Set up UptimeRobot for health checks
   - Enable email alerts in Render
   - Monitor Stripe Dashboard for failed payments

---

**Need help?** Check DEPLOYMENT_GUIDE.md for detailed documentation.
