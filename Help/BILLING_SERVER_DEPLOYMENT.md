# 🏦 Billing Server Deployment Guide (Google Cloud)

## 📊 Your Current Setup

```
┌─────────────────────────────────────────────────────────┐
│                   YOUR EXISTING SETUP                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ Frontend (React)         → Google Cloud             │
│  ✅ Traccar Server            → api.traczi.com          │
│                                                          │
│  ❌ Billing Server (Node.js)  → NEEDS DEPLOYMENT        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🎯 What You Need to Deploy

**Just 1 component:** The billing middleware server (`/server` folder)

**Purpose:**
- Handles Stripe checkout creation
- Receives Stripe webhooks
- Creates users in Traccar
- Manages subscriptions

---

## 🚀 Deployment Options for Google Cloud

### Option 1: Cloud Run (Recommended)
- **Best for:** Serverless, auto-scaling
- **Cost:** Pay per request, very cheap
- **Setup time:** 10 minutes

### Option 2: Compute Engine VM
- **Best for:** Full control, always-on
- **Cost:** ~$5-10/month for small VM
- **Setup time:** 20 minutes

### Option 3: App Engine
- **Best for:** Managed platform
- **Cost:** ~$10/month minimum
- **Setup time:** 15 minutes

---

## 📦 Option 1: Deploy to Cloud Run (Recommended)

### Step 1: Prepare Your Code

1. **Create Dockerfile in `/server` folder:**

```bash
cd /Users/gauravpawar/Desktop/mobile_App/traczi-web/server
```

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["npm", "start"]
```

2. **Create `.dockerignore` file:**

```
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
README.md
test-*.js
```

### Step 2: Build and Push to Google Container Registry

```bash
# Set your project ID
export PROJECT_ID=your-google-cloud-project-id

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Build container image
gcloud builds submit --tag gcr.io/$PROJECT_ID/traczi-billing-server

# This will build and push to Google Container Registry
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy traczi-billing-server \
  --image gcr.io/$PROJECT_ID/traczi-billing-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 4000 \
  --memory 512Mi \
  --set-env-vars NODE_ENV=production \
  --set-env-vars PORT=4000
```

**You'll get a URL like:** `https://traczi-billing-server-xxxxx-uc.a.run.app`

### Step 4: Add Environment Variables

```bash
# Set all required environment variables
gcloud run services update traczi-billing-server \
  --region us-central1 \
  --set-env-vars "
NODE_ENV=production,
PORT=4000,
STRIPE_SECRET_KEY=sk_live_your_key,
STRIPE_PUBLISHABLE_KEY=pk_live_your_key,
STRIPE_WEBHOOK_SECRET=whsec_your_secret,
STRIPE_PRICE_BASIC=price_xxx,
STRIPE_PRICE_MODERATE=price_xxx,
STRIPE_PRICE_ADVANCE=price_xxx,
TRACCAR_BASE_URL=https://api.traczi.com,
TRACCAR_ADMIN_EMAIL=your_admin@email.com,
TRACCAR_ADMIN_PASSWORD=your_password,
FRONTEND_URL=https://your-frontend-url.com,
SUCCESS_URL=https://your-frontend-url.com/registration-success,
CANCEL_URL=https://your-frontend-url.com/register,
ALLOWED_ORIGINS=https://your-frontend-url.com
"
```

**OR use Google Cloud Console:**
1. Go to Cloud Run → Select your service
2. Click "EDIT & DEPLOY NEW REVISION"
3. Go to "Variables & Secrets" tab
4. Add each environment variable
5. Click "DEPLOY"

---

## 🖥️ Option 2: Deploy to Compute Engine VM

### Step 1: Create VM Instance

```bash
# Create VM
gcloud compute instances create traczi-billing-server \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server,https-server
```

### Step 2: Configure Firewall

```bash
# Allow traffic on port 4000
gcloud compute firewall-rules create allow-billing-server \
  --allow tcp:4000 \
  --target-tags http-server
```

### Step 3: SSH into VM and Setup

```bash
# SSH into VM
gcloud compute ssh traczi-billing-server --zone=us-central1-a

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create app directory
mkdir -p /home/traczi-billing
cd /home/traczi-billing

# Clone or upload your code here
# Option 1: Use git
git clone https://github.com/your-username/traczi-web.git
cd traczi-web/server

# Option 2: Use gcloud scp
# (Run this from your local machine)
# gcloud compute scp --recurse /Users/gauravpawar/Desktop/mobile_App/traczi-web/server traczi-billing-server:/home/traczi-billing/ --zone=us-central1-a
```

### Step 4: Install Dependencies

```bash
cd /home/traczi-billing/server
npm install --production
```

### Step 5: Create Environment File

```bash
nano .env
```

Add:
```env
NODE_ENV=production
PORT=4000

STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret

STRIPE_PRICE_BASIC=price_xxx
STRIPE_PRICE_MODERATE=price_xxx
STRIPE_PRICE_ADVANCE=price_xxx

TRACCAR_BASE_URL=https://api.traczi.com
TRACCAR_ADMIN_EMAIL=your_admin@email.com
TRACCAR_ADMIN_PASSWORD=your_password

FRONTEND_URL=https://your-frontend-url.com
SUCCESS_URL=https://your-frontend-url.com/registration-success
CANCEL_URL=https://your-frontend-url.com/register

ALLOWED_ORIGINS=https://your-frontend-url.com
```

Save with `Ctrl+X`, `Y`, `Enter`

### Step 6: Start Server with PM2

```bash
# Start the server
pm2 start index.js --name traczi-billing

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Follow the command it shows (run the sudo command it prints)
```

### Step 7: Get External IP

```bash
gcloud compute instances describe traczi-billing-server \
  --zone=us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)'
```

**Your billing server URL:** `http://YOUR_EXTERNAL_IP:4000`

---

## 🔗 Configure Dependencies

### Dependency Flow:

```
┌─────────────┐
│   Stripe    │ ──webhooks──┐
└─────────────┘              │
                             ▼
┌─────────────┐        ┌──────────────────┐        ┌─────────────┐
│  Frontend   │───────▶│  Billing Server  │───────▶│   Traccar   │
│ (React App) │        │   (Node.js)      │        │   Server    │
└─────────────┘        └──────────────────┘        └─────────────┘
                              │
                              └──────────────────────┘
                            creates users & manages limits
```

### 1. Update Frontend Configuration

**On your Google Cloud frontend server:**

Update environment variables:
```bash
VITE_BILLING_API_URL=https://your-billing-server-url.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

**If using Cloud Run:**
```bash
VITE_BILLING_API_URL=https://traczi-billing-server-xxxxx-uc.a.run.app
```

**If using Compute Engine:**
```bash
VITE_BILLING_API_URL=http://YOUR_VM_EXTERNAL_IP:4000
```

Then rebuild and redeploy frontend.

### 2. Configure Stripe Webhook

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Click "Add endpoint"**
3. **Endpoint URL:**
   - Cloud Run: `https://traczi-billing-server-xxxxx-uc.a.run.app/webhooks/stripe`
   - Compute Engine: `http://YOUR_VM_IP:4000/webhooks/stripe`

4. **Select events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`
   - ✅ `invoice.payment_succeeded`

5. **Copy the Signing Secret** (`whsec_xxx`)

6. **Update billing server environment:**
   - Cloud Run: Use `gcloud run services update` (see Step 4 above)
   - Compute Engine: Update `.env` file and restart: `pm2 restart traczi-billing`

### 3. Test Connection

```bash
# Test billing server health
curl https://your-billing-server-url.com/health

# Should return:
# {"status":"ok","timestamp":"..."}

# Test Stripe webhook
# In Stripe Dashboard → Webhooks → Send test webhook
```

---

## 🔐 Set up HTTPS (Recommended)

### For Cloud Run
✅ **Already has HTTPS by default!**

### For Compute Engine

**Option A: Use Google Cloud Load Balancer**
1. Create SSL certificate in Google Cloud
2. Set up HTTPS Load Balancer
3. Point to your VM backend

**Option B: Use Let's Encrypt + Nginx**

```bash
# Install Nginx
sudo apt install nginx

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Configure Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/billing

# Add:
server {
    listen 80;
    server_name billing.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/billing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d billing.yourdomain.com
```

---

## 🧪 Testing Checklist

### Test 1: Server is Running
```bash
curl https://your-billing-server-url.com/health
```
✅ Should return: `{"status":"ok",...}`

### Test 2: Stripe Connection
```bash
curl https://your-billing-server-url.com/billing/plans
```
✅ Should return list of plans

### Test 3: Traccar Connection
Check server logs for:
```
✅ Successfully authenticated with Traccar
```

### Test 4: End-to-End Registration
1. Go to your frontend
2. Register new account
3. Select plan and pay
4. Check logs:
   - ✅ `Checkout completed`
   - ✅ `✓ Login test successful`
   - ✅ `Successfully created user X`

### Test 5: Webhook
1. Go to Stripe Dashboard → Webhooks
2. Click on your webhook
3. Click "Send test webhook"
4. Select `checkout.session.completed`
5. Check server logs for webhook processing

---

## 📊 Monitoring

### Cloud Run
```bash
# View logs
gcloud run services logs read traczi-billing-server --region us-central1

# Follow logs in real-time
gcloud run services logs tail traczi-billing-server --region us-central1
```

### Compute Engine
```bash
# View PM2 logs
pm2 logs traczi-billing

# View PM2 status
pm2 status

# Monitor in real-time
pm2 monit
```

### Set Up Logging

**Enable Cloud Logging:**
```bash
# Install Winston Google Cloud logging
npm install @google-cloud/logging-winston

# Already configured in your logger.js
```

**View logs in Cloud Console:**
- Go to Cloud Logging
- Filter by resource: `Cloud Run Service` or `VM Instance`
- Search for errors: `severity=ERROR`

---

## 🔄 Updating the Billing Server

### Cloud Run
```bash
# Make code changes
cd /Users/gauravpawar/Desktop/mobile_App/traczi-web/server

# Rebuild and deploy
gcloud builds submit --tag gcr.io/$PROJECT_ID/traczi-billing-server
gcloud run deploy traczi-billing-server --image gcr.io/$PROJECT_ID/traczi-billing-server --region us-central1
```

### Compute Engine
```bash
# SSH into VM
gcloud compute ssh traczi-billing-server --zone=us-central1-a

# Pull latest code
cd /home/traczi-billing/server
git pull

# Install dependencies
npm install --production

# Restart server
pm2 restart traczi-billing

# Check status
pm2 status
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to billing server

**Solution:**
```bash
# Check if server is running
# Cloud Run:
gcloud run services describe traczi-billing-server --region us-central1

# Compute Engine:
pm2 status
```

### Issue: Webhook signature verification failed

**Solution:**
1. Check `STRIPE_WEBHOOK_SECRET` is correct
2. Ensure webhook URL matches exactly
3. Test with Stripe CLI:
```bash
stripe listen --forward-to https://your-billing-server-url.com/webhooks/stripe
```

### Issue: CORS errors from frontend

**Solution:**
1. Check `ALLOWED_ORIGINS` includes your frontend URL
2. Ensure URL format matches exactly (no trailing slash)
3. Restart billing server after changing env vars

### Issue: User creation fails

**Solution:**
1. Check Traccar admin credentials
2. Test Traccar connection:
```bash
curl -X POST https://api.traczi.com/api/session \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=admin@email.com&password=your_password"
```
3. Check server logs for detailed error

---

## 💰 Cost Estimation

### Cloud Run (Recommended)
- **Free tier:** 2 million requests/month
- **Estimated cost:** $0-5/month for small usage
- **Billing:** Pay per request + CPU time

### Compute Engine e2-micro
- **Cost:** ~$7/month (always-on)
- **Free tier:** 1 e2-micro instance (certain regions)

### Tip: Start with Cloud Run (free), upgrade if needed

---

## 🎯 Quick Start Commands

### Deploy to Cloud Run (All-in-One)

```bash
# Set project
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Build & Deploy
cd /Users/gauravpawar/Desktop/mobile_App/traczi-web/server
gcloud builds submit --tag gcr.io/$PROJECT_ID/traczi-billing-server
gcloud run deploy traczi-billing-server \
  --image gcr.io/$PROJECT_ID/traczi-billing-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 4000

# Add environment variables (see Step 4 above)

# Done! Get URL:
gcloud run services describe traczi-billing-server --region us-central1 --format='value(status.url)'
```

---

## 📞 Support

If you need help:
1. Check Cloud Logging for errors
2. Verify environment variables
3. Test each component separately
4. Check Stripe webhook logs

**Useful Commands:**
```bash
# Check Cloud Run service
gcloud run services describe traczi-billing-server --region us-central1

# View logs
gcloud run services logs tail traczi-billing-server --region us-central1

# Update environment variables
gcloud run services update traczi-billing-server --region us-central1 --set-env-vars KEY=value
```

Good luck with your deployment! 🚀
