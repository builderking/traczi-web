# 📋 Deployment Checklist

## ✅ Pre-Deployment Checklist

### Code Preparation
- [ ] All code changes committed to Git
- [ ] `.env` files added to `.gitignore` (don't commit secrets!)
- [ ] Tested locally end-to-end:
  - [ ] Registration flow
  - [ ] Payment flow
  - [ ] Login
  - [ ] Device limits
  - [ ] Subscription page

### Stripe Setup
- [ ] Stripe account in **LIVE mode**
- [ ] API keys obtained (pk_live_xxx, sk_live_xxx)
- [ ] Products created in LIVE mode:
  - [ ] Basic Plan with price ID
  - [ ] Moderate Plan with price ID
  - [ ] Advanced Plan with price ID
- [ ] Payment methods enabled
- [ ] 3D Secure configured

### Traccar Setup
- [ ] Traccar server running at api.traczi.com
- [ ] Admin credentials working
- [ ] API accessible
- [ ] Test user can be created

---

## 🚀 Deployment Steps

### 1. Backend Deployment (Render.com)

- [ ] Create account on Render.com
- [ ] Connect GitHub repository
- [ ] Create new Web Service
- [ ] Configure build settings:
  ```
  Build Command: cd server && npm install
  Start Command: cd server && npm start
  ```
- [ ] Add ALL environment variables:
  - [ ] NODE_ENV=production
  - [ ] PORT=4000
  - [ ] STRIPE_SECRET_KEY
  - [ ] STRIPE_PUBLISHABLE_KEY
  - [ ] STRIPE_WEBHOOK_SECRET (add later)
  - [ ] STRIPE_PRICE_BASIC
  - [ ] STRIPE_PRICE_MODERATE
  - [ ] STRIPE_PRICE_ADVANCE
  - [ ] TRACCAR_BASE_URL
  - [ ] TRACCAR_ADMIN_EMAIL
  - [ ] TRACCAR_ADMIN_PASSWORD
  - [ ] FRONTEND_URL (add after frontend deploy)
  - [ ] SUCCESS_URL (add after frontend deploy)
  - [ ] CANCEL_URL (add after frontend deploy)
  - [ ] ALLOWED_ORIGINS (add after frontend deploy)
- [ ] Deploy and copy URL
- [ ] Test health check: `https://your-backend.onrender.com/health`

### 2. Frontend Deployment (Render.com)

- [ ] Create new Static Site
- [ ] Connect same GitHub repository
- [ ] Configure build settings:
  ```
  Build Command: npm run build
  Publish Directory: build
  ```
- [ ] Add environment variables:
  - [ ] VITE_STRIPE_PUBLISHABLE_KEY
  - [ ] VITE_BILLING_API_URL (backend URL from step 1)
- [ ] Deploy and copy URL
- [ ] Test frontend loads

### 3. Update Backend Configuration

- [ ] Go back to backend settings
- [ ] Update environment variables:
  - [ ] FRONTEND_URL=https://your-frontend.onrender.com
  - [ ] SUCCESS_URL=https://your-frontend.onrender.com/registration-success
  - [ ] CANCEL_URL=https://your-frontend.onrender.com/register
  - [ ] ALLOWED_ORIGINS=https://your-frontend.onrender.com
- [ ] Manual deploy backend

### 4. Configure Stripe Webhook

- [ ] Go to Stripe Dashboard → Developers → Webhooks
- [ ] Click "Add endpoint"
- [ ] Set endpoint URL: `https://your-backend.onrender.com/webhooks/stripe`
- [ ] Select events:
  - [ ] checkout.session.completed
  - [ ] customer.subscription.created
  - [ ] customer.subscription.updated
  - [ ] customer.subscription.deleted
  - [ ] invoice.payment_failed
  - [ ] invoice.payment_succeeded
- [ ] Copy webhook signing secret (whsec_xxx)
- [ ] Add to backend env: STRIPE_WEBHOOK_SECRET
- [ ] Redeploy backend
- [ ] Test webhook with "Send test webhook" in Stripe

---

## 🧪 Post-Deployment Testing

### Test Registration Flow
- [ ] Go to frontend URL
- [ ] Click Register
- [ ] Fill in details
- [ ] Select a plan
- [ ] Enter Stripe test card:
  ```
  Card: 4242 4242 4242 4242
  Expiry: 12/34
  CVC: 123
  ZIP: 12345
  ```
- [ ] Complete payment
- [ ] Verify redirect to success page
- [ ] Verify password is displayed
- [ ] Check backend logs for:
  - [ ] `✓ Login test successful`
  - [ ] `Checkout completed`

### Test Login
- [ ] Use credentials from success page
- [ ] Login successfully
- [ ] Dashboard loads

### Test Device Management
- [ ] Go to Settings → Devices
- [ ] Add a device
- [ ] Verify device appears
- [ ] Go to Settings → Subscription
- [ ] Verify device count increases
- [ ] Try to add devices up to limit
- [ ] Verify error when limit reached

### Test Subscription Management
- [ ] Go to Settings → Subscription
- [ ] Click "Manage Subscription"
- [ ] Verify Stripe portal opens
- [ ] Test updating payment method
- [ ] Test canceling subscription

---

## 🔧 Monitoring Setup

### Set Up Alerts
- [ ] Enable email alerts in Render dashboard
- [ ] Set up UptimeRobot for health checks
- [ ] Monitor Stripe webhook logs

### Set Up Error Tracking (Optional)
- [ ] Create Sentry account
- [ ] Add Sentry DSN to backend
- [ ] Add Sentry DSN to frontend
- [ ] Test error reporting

### Set Up Analytics (Optional)
- [ ] Add Google Analytics
- [ ] Add Mixpanel/Amplitude
- [ ] Track key events:
  - [ ] Registration started
  - [ ] Registration completed
  - [ ] Device added
  - [ ] Subscription upgraded

---

## 🌐 Custom Domain (Optional)

### Purchase Domain
- [ ] Buy domain from Namecheap/GoDaddy
- [ ] Verify ownership

### Configure Frontend Domain
- [ ] In Render: Settings → Custom Domain
- [ ] Add domain: `app.yourdomain.com`
- [ ] Update DNS records:
  ```
  Type: CNAME
  Name: app
  Value: your-app.onrender.com
  ```
- [ ] Wait for DNS propagation (up to 24h)
- [ ] Verify HTTPS certificate issued

### Configure Backend Domain
- [ ] Add domain: `api.yourdomain.com`
- [ ] Update DNS records:
  ```
  Type: CNAME
  Name: api
  Value: your-backend.onrender.com
  ```
- [ ] Update all frontend env vars with new domain
- [ ] Update Stripe webhook URL
- [ ] Redeploy everything

---

## 🔐 Security Checklist

- [ ] All `.env` files in `.gitignore`
- [ ] No secrets committed to Git
- [ ] HTTPS enabled (automatic on Render)
- [ ] CORS configured correctly
- [ ] Strong Traccar admin password
- [ ] Stripe webhook signature verification enabled
- [ ] Rate limiting enabled
- [ ] Error messages don't expose sensitive info

---

## 📊 Production Readiness

### Performance
- [ ] Frontend assets optimized
- [ ] Images compressed
- [ ] Bundle size acceptable
- [ ] Lazy loading enabled
- [ ] PWA working offline

### Compliance
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Cookie consent (if needed)
- [ ] GDPR compliance (if EU users)
- [ ] Stripe terms displayed

### Documentation
- [ ] API documentation (if needed)
- [ ] User guides
- [ ] FAQ page
- [ ] Support email configured

---

## 🎉 Launch!

Once all checkboxes are ticked:

- [ ] Announce launch
- [ ] Monitor logs for 24h
- [ ] Watch for Stripe webhook failures
- [ ] Check user registrations
- [ ] Respond to support requests
- [ ] Celebrate! 🎊

---

## 📞 Emergency Contacts

**If something breaks:**

1. Check Render logs
2. Check Stripe webhook logs
3. Check browser console
4. Roll back to previous deployment
5. Contact support:
   - Render: support@render.com
   - Stripe: https://support.stripe.com

**Backup Plan:**
- Keep local environment working
- Document all changes
- Have database backups
- Know how to rollback

---

## 🔄 Next Steps

After successful deployment:

- [ ] Set up staging environment
- [ ] Create backup strategy
- [ ] Plan for scaling
- [ ] Add more features
- [ ] Optimize performance
- [ ] Improve monitoring

---

**Good luck with your deployment!** 🚀

Refer to:
- **QUICK_DEPLOY.md** for step-by-step instructions
- **DEPLOYMENT_GUIDE.md** for detailed documentation
- **README.md** for local development
