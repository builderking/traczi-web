# ⚙️ Configuration Quick Reference

## 🎯 What You Need to Configure

Since you already have:
- ✅ Frontend on Google Cloud
- ✅ Traccar at api.traczi.com

You only need to:
1. Deploy billing server
2. Update frontend environment variables
3. Configure Stripe webhook

---

## 📝 Configuration Values You'll Need

### From Your Existing Setup:

```bash
# Already deployed
FRONTEND_URL=https://your-frontend-on-google-cloud.com
TRACCAR_URL=https://api.traczi.com
TRACCAR_ADMIN_EMAIL=your_admin@email.com
TRACCAR_ADMIN_PASSWORD=your_password
```

### From Stripe (Get these now):

1. Go to **stripe.com/dashboard**
2. Switch to **LIVE MODE** (toggle top-right)
3. Go to **Developers** → **API Keys**

```bash
STRIPE_PUBLISHABLE_KEY=pk_live_51XXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_live_51XXXXXXXXXXXXXXX
```

4. Go to **Products** → Create 3 products → Copy price IDs

```bash
STRIPE_PRICE_BASIC=price_1XXXXXXXXXXXXXXX
STRIPE_PRICE_MODERATE=price_1XXXXXXXXXXXXXXX
STRIPE_PRICE_ADVANCE=price_1XXXXXXXXXXXXXXX
```

---

## 🚀 Step-by-Step Configuration

### Step 1: Deploy Billing Server to Google Cloud Run

```bash
# Navigate to server folder
cd /Users/gauravpawar/Desktop/mobile_App/traczi-web/server

# Set your Google Cloud project
export PROJECT_ID=your-google-cloud-project-id

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Build and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/traczi-billing-server

gcloud run deploy traczi-billing-server \
  --image gcr.io/$PROJECT_ID/traczi-billing-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 4000 \
  --memory 512Mi
```

**Copy the URL you get!** Example: `https://traczi-billing-server-xxxxx-uc.a.run.app`

### Step 2: Configure Billing Server Environment Variables

```bash
# Replace these with YOUR actual values:
gcloud run services update traczi-billing-server \
  --region us-central1 \
  --update-env-vars \
NODE_ENV=production,\
PORT=4000,\
STRIPE_SECRET_KEY=sk_live_PASTE_YOUR_KEY_HERE,\
STRIPE_PUBLISHABLE_KEY=pk_live_PASTE_YOUR_KEY_HERE,\
STRIPE_WEBHOOK_SECRET=whsec_temporary_will_update_later,\
STRIPE_PRICE_BASIC=price_PASTE_YOUR_PRICE_ID,\
STRIPE_PRICE_MODERATE=price_PASTE_YOUR_PRICE_ID,\
STRIPE_PRICE_ADVANCE=price_PASTE_YOUR_PRICE_ID,\
TRACCAR_BASE_URL=https://api.traczi.com,\
TRACCAR_ADMIN_EMAIL=PASTE_YOUR_ADMIN_EMAIL,\
TRACCAR_ADMIN_PASSWORD=PASTE_YOUR_ADMIN_PASSWORD,\
FRONTEND_URL=PASTE_YOUR_FRONTEND_URL,\
SUCCESS_URL=PASTE_YOUR_FRONTEND_URL/registration-success,\
CANCEL_URL=PASTE_YOUR_FRONTEND_URL/register,\
ALLOWED_ORIGINS=PASTE_YOUR_FRONTEND_URL
```

### Step 3: Update Frontend Configuration

**On your Google Cloud frontend:**

Update environment variables (via Cloud Console or command line):

```bash
VITE_BILLING_API_URL=https://traczi-billing-server-xxxxx-uc.a.run.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_PASTE_YOUR_KEY_HERE
```

**Then rebuild and redeploy your frontend.**

### Step 4: Configure Stripe Webhook

1. Go to **stripe.com/dashboard** → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter:
   ```
   Endpoint URL: https://traczi-billing-server-xxxxx-uc.a.run.app/webhooks/stripe
   ```
4. Select these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_succeeded`

5. Click **"Add endpoint"**
6. **Copy the Signing Secret** (starts with `whsec_`)
7. Update billing server:
   ```bash
   gcloud run services update traczi-billing-server \
     --region us-central1 \
     --update-env-vars STRIPE_WEBHOOK_SECRET=whsec_PASTE_YOUR_SECRET_HERE
   ```

---

## 📋 Configuration Checklist

Use this to track your progress:

### Billing Server Setup
- [ ] Deployed to Cloud Run
- [ ] Health check working: `curl https://your-billing-url.com/health`
- [ ] Environment variables configured
- [ ] Can fetch plans: `curl https://your-billing-url.com/billing/plans`

### Frontend Configuration
- [ ] `VITE_BILLING_API_URL` updated to billing server URL
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` set
- [ ] Rebuilt and redeployed
- [ ] Can access frontend in browser
- [ ] No CORS errors in browser console

### Stripe Configuration
- [ ] Account in LIVE mode
- [ ] 3 products created with price IDs
- [ ] Webhook endpoint added
- [ ] Webhook signing secret copied
- [ ] Test webhook sent successfully

### Testing
- [ ] Registration flow works
- [ ] Payment succeeds
- [ ] User created in Traccar
- [ ] Login works
- [ ] Subscription page shows correct info
- [ ] Can add devices
- [ ] Device limit enforced

---

## 🔗 Important URLs

Fill these in as you deploy:

```
Frontend URL:
https://___________________________________

Billing Server URL:
https://___________________________________

Traccar URL:
https://api.traczi.com (already set)

Stripe Dashboard:
https://dashboard.stripe.com

Google Cloud Console:
https://console.cloud.google.com
```

---

## 🧪 Test Commands

### Test 1: Billing Server Health
```bash
curl https://YOUR_BILLING_URL/health
```
Expected: `{"status":"ok","timestamp":"..."}`

### Test 2: List Plans
```bash
curl https://YOUR_BILLING_URL/billing/plans
```
Expected: JSON with 3 plans

### Test 3: Frontend Access
Open in browser: `https://YOUR_FRONTEND_URL`
Expected: Login page loads, no errors

### Test 4: Stripe Webhook
In Stripe Dashboard → Webhooks → Your endpoint → "Send test webhook"
Expected: Success (200 response)

---

## 🐛 Quick Troubleshooting

### Problem: CORS Error
```
Access to fetch at 'https://billing...' from origin 'https://frontend...'
has been blocked by CORS policy
```

**Fix:**
```bash
# Update billing server
gcloud run services update traczi-billing-server \
  --region us-central1 \
  --update-env-vars ALLOWED_ORIGINS=https://YOUR_ACTUAL_FRONTEND_URL
```

### Problem: Stripe Webhook Fails
```
Invalid webhook signature
```

**Fix:**
1. Check webhook secret in Stripe Dashboard
2. Update billing server:
   ```bash
   gcloud run services update traczi-billing-server \
     --region us-central1 \
     --update-env-vars STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET
   ```

### Problem: User Not Created
```
Failed to authenticate with Traccar
```

**Fix:**
Check Traccar credentials:
```bash
# Test manually
curl -X POST https://api.traczi.com/api/session \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=YOUR_ADMIN_EMAIL&password=YOUR_ADMIN_PASSWORD"
```

If that works, update billing server with correct credentials.

---

## 📞 Need Help?

1. **Check logs:**
   ```bash
   gcloud run services logs tail traczi-billing-server --region us-central1
   ```

2. **View all environment variables:**
   ```bash
   gcloud run services describe traczi-billing-server --region us-central1
   ```

3. **Update a single variable:**
   ```bash
   gcloud run services update traczi-billing-server \
     --region us-central1 \
     --update-env-vars KEY=VALUE
   ```

---

## 📚 Full Documentation

- **BILLING_SERVER_DEPLOYMENT.md** - Detailed deployment guide
- **ARCHITECTURE_AND_DEPENDENCIES.md** - How components connect
- **DEPLOYMENT_GUIDE.md** - Complete deployment documentation
- **QUICK_DEPLOY.md** - Quick start guide

---

## ✅ You're Done When...

- [ ] Can register new user end-to-end
- [ ] Payment succeeds in Stripe
- [ ] User created in Traccar
- [ ] Can login with new credentials
- [ ] Subscription page shows correct device count
- [ ] Can add devices (respects limit)
- [ ] No errors in logs

**Congratulations! Your billing system is live! 🎉**
