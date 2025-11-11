# 🏗️ Architecture & Dependencies

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TRACZI SYSTEM                                │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                  │         │                  │         │                 │
│   Frontend       │────────▶│  Billing Server  │────────▶│  Traccar Server │
│   (React/Vite)   │         │   (Node/Express) │         │   (GPS Backend) │
│                  │         │                  │         │                 │
│  Google Cloud    │         │  Google Cloud    │         │  api.traczi.com │
│  ✅ DEPLOYED     │         │  ❌ TO DEPLOY    │         │  ✅ DEPLOYED    │
└──────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │
│  User Browser    │         │  Stripe API      │
│                  │         │  (Payments)      │
└──────────────────┘         └──────────────────┘
```

## 🔗 Dependencies & Data Flow

### 1. User Registration Flow

```
User
  │
  ├─1─▶ Frontend: Fill registration form
  │     └─ Inputs: name, email, password, plan selection
  │
  ├─2─▶ Billing Server: POST /billing/checkout
  │     └─ Creates Stripe checkout session
  │     └─ Returns: Stripe checkout URL
  │
  ├─3─▶ Stripe: User completes payment
  │     └─ Stripe processes payment
  │
  ├─4─▶ Billing Server: webhook /webhooks/stripe
  │     └─ Event: checkout.session.completed
  │     └─ Extracts: email, password, plan details
  │
  ├─5─▶ Traccar API: POST /api/users
  │     └─ Creates user account
  │     └─ Sets device limit
  │
  ├─6─▶ Frontend: Redirect to success page
  │     └─ Shows: email, password, plan details
  │
  └─7─▶ User can now login!
```

### 2. User Login Flow

```
User
  │
  ├─1─▶ Frontend: Enter email & password
  │
  ├─2─▶ Traccar API: POST /api/session
  │     └─ Validates credentials
  │     └─ Returns: user object with session
  │
  └─3─▶ Frontend: Redirect to dashboard
        └─ Shows: devices, subscription info
```

### 3. Device Management Flow

```
User
  │
  ├─1─▶ Frontend: Add new device
  │
  ├─2─▶ EditItemView: Check device limit
  │     └─ GET /api/devices (count current)
  │     └─ Compare with user.deviceLimit
  │
  ├─3a─▶ IF limit not reached:
  │      └─ Traccar API: POST /api/devices
  │      └─ Device created ✅
  │
  └─3b─▶ IF limit reached:
         └─ Show error message ❌
         └─ "Please upgrade your plan"
```

### 4. Subscription Management Flow

```
User
  │
  ├─1─▶ Frontend: View Settings → Subscription
  │     └─ GET /api/devices (get count)
  │     └─ Shows: X of Y devices used
  │
  ├─2─▶ Click "Manage Subscription"
  │
  ├─3─▶ Billing Server: POST /billing/portal
  │     └─ Creates Stripe portal session
  │     └─ Returns: portal URL
  │
  └─4─▶ Stripe Portal: Manage subscription
        └─ Update payment method
        └─ Cancel subscription
        └─ Upgrade/downgrade plan
```

## 🔌 Component Dependencies

### Frontend Dependencies

**Required Services:**
- ✅ Billing Server (for registration & payments)
- ✅ Traccar Server (for login & device management)
- ❌ No direct dependency on Stripe

**Environment Variables:**
```env
VITE_BILLING_API_URL=https://your-billing-server.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

**APIs Called:**
```
# Billing Server APIs
POST   /billing/checkout        → Create checkout session
POST   /billing/portal          → Create portal session
GET    /billing/plans           → Get available plans
GET    /billing/session/:id     → Get checkout session details

# Traccar APIs (proxied)
POST   /api/session             → Login
GET    /api/devices             → List devices
POST   /api/devices             → Create device
PUT    /api/devices/:id         → Update device
DELETE /api/devices/:id         → Delete device
GET    /api/users               → Get user info
```

### Billing Server Dependencies

**Required Services:**
- ✅ Stripe API (for payments)
- ✅ Traccar Server (for user management)
- ❌ No direct dependency on Frontend (receives webhooks)

**Environment Variables:**
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_BASIC=price_xxx
STRIPE_PRICE_MODERATE=price_xxx
STRIPE_PRICE_ADVANCE=price_xxx

# Traccar
TRACCAR_BASE_URL=https://api.traczi.com
TRACCAR_ADMIN_EMAIL=admin@example.com
TRACCAR_ADMIN_PASSWORD=your_password

# Frontend
FRONTEND_URL=https://your-frontend.com
SUCCESS_URL=https://your-frontend.com/registration-success
CANCEL_URL=https://your-frontend.com/register
ALLOWED_ORIGINS=https://your-frontend.com
```

**External APIs Called:**
```
# Stripe API
POST   stripe.com/v1/checkout/sessions     → Create checkout
POST   stripe.com/v1/billing_portal/sessions → Create portal
GET    stripe.com/v1/subscriptions/:id     → Get subscription

# Traccar API
POST   api.traczi.com/api/session          → Admin login
POST   api.traczi.com/api/users            → Create user
GET    api.traczi.com/api/users            → List users
PUT    api.traczi.com/api/users/:id        → Update user
```

### Traccar Server Dependencies

**Required Services:**
- ❌ No dependencies on other services
- ✅ Standalone GPS tracking backend

**Receives Requests From:**
- Frontend (via proxy)
- Billing Server (user creation)

## 📝 Configuration Matrix

| Component | Needs Frontend URL | Needs Billing URL | Needs Traccar URL | Needs Stripe Keys |
|-----------|-------------------|-------------------|-------------------|-------------------|
| **Frontend** | ❌ | ✅ Yes | ✅ Yes (proxy) | ✅ Publishable only |
| **Billing Server** | ✅ Yes | ❌ | ✅ Yes | ✅ Secret + Publishable |
| **Traccar** | ❌ | ❌ | ❌ | ❌ |

## 🔄 Deployment Order

### Recommended Order:

```
1. ✅ Traccar Server (Already deployed)
   └─ URL: https://api.traczi.com

2. ❌ Billing Server (Deploy next)
   └─ Deploy to Google Cloud Run/Compute
   └─ Configure environment variables
   └─ Get URL: https://billing.yourdomain.com

3. ✅ Frontend (Update configuration)
   └─ Update VITE_BILLING_API_URL
   └─ Rebuild and redeploy

4. ❌ Stripe Webhook (Configure last)
   └─ Add webhook endpoint in Stripe
   └─ Point to: https://billing.yourdomain.com/webhooks/stripe
```

### Why This Order?

1. **Traccar First:** Foundation - must exist for users to be created
2. **Billing Server Second:** Needs Traccar URL, provides URL for Frontend
3. **Frontend Third:** Needs Billing Server URL to function
4. **Stripe Last:** Needs Billing Server URL to send webhooks

## 🚨 Critical Configuration Points

### Point 1: Billing Server ↔ Frontend

**Frontend needs:**
```javascript
// In frontend .env
VITE_BILLING_API_URL=https://billing-server-url.com
```

**Billing Server needs:**
```bash
# In billing server .env
ALLOWED_ORIGINS=https://frontend-url.com
```

⚠️ **If mismatch:** CORS errors, payment won't work

### Point 2: Billing Server ↔ Traccar

**Billing Server needs:**
```bash
TRACCAR_BASE_URL=https://api.traczi.com
TRACCAR_ADMIN_EMAIL=admin@email.com
TRACCAR_ADMIN_PASSWORD=password
```

⚠️ **If wrong:** User creation fails after payment

### Point 3: Stripe ↔ Billing Server

**Stripe webhook needs:**
```
Endpoint: https://billing-server-url.com/webhooks/stripe
```

**Billing Server needs:**
```bash
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

⚠️ **If mismatch:** Webhooks fail, users not created

### Point 4: Frontend ↔ Traccar

**Frontend vite.config.js needs:**
```javascript
proxy: {
  '/api': 'https://api.traczi.com',
}
```

⚠️ **If wrong:** Login fails, devices don't load

## ✅ Configuration Checklist

### Before Deployment:

- [ ] Traccar server is accessible at api.traczi.com
- [ ] Traccar admin credentials are correct
- [ ] Stripe account is in LIVE mode
- [ ] Stripe products & prices are created
- [ ] Domain names are decided (if using custom domains)

### During Billing Server Deployment:

- [ ] Environment variables are set correctly
- [ ] Can access: https://billing-url.com/health
- [ ] Can fetch plans: https://billing-url.com/billing/plans
- [ ] CORS is configured for frontend origin

### After Billing Server Deployment:

- [ ] Frontend VITE_BILLING_API_URL updated
- [ ] Frontend rebuilt and redeployed
- [ ] Stripe webhook configured
- [ ] Test registration flow end-to-end
- [ ] Test login
- [ ] Test device management

## 🧪 Testing Checklist

### Test 1: Billing Server Health
```bash
curl https://your-billing-server.com/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Test 2: Billing Server → Traccar
```bash
# Check server logs for:
"✅ Successfully authenticated with Traccar"
```

### Test 3: Frontend → Billing Server
```bash
# In browser console, check network tab
# Should see requests to: https://your-billing-server.com/billing/plans
# Should NOT see CORS errors
```

### Test 4: Stripe → Billing Server
```bash
# In Stripe Dashboard → Webhooks
# Send test webhook
# Check server logs for: "Received Stripe webhook: checkout.session.completed"
```

### Test 5: End-to-End
1. Register new user
2. Select plan and pay
3. Verify user created in Traccar
4. Login with credentials
5. Add device
6. Check device appears

## 📊 Monitoring Points

### What to Monitor:

1. **Billing Server Uptime**
   - Health check: `/health` endpoint
   - Alert if down > 5 minutes

2. **Stripe Webhook Success Rate**
   - Check Stripe Dashboard → Webhooks
   - Alert if failure rate > 5%

3. **User Creation Success Rate**
   - Monitor logs for "Successfully created user"
   - Alert if failures occur

4. **Traccar Connection**
   - Monitor "Successfully authenticated"
   - Alert if authentication fails

## 🐛 Common Issues & Solutions

### Issue: CORS errors in browser

**Cause:** Frontend URL not in ALLOWED_ORIGINS
**Solution:**
```bash
# Update billing server env
ALLOWED_ORIGINS=https://your-actual-frontend.com
# Restart billing server
```

### Issue: User created but can't login

**Cause:** Password mismatch or wrong Traccar URL
**Solution:**
```bash
# Check logs for: "✓ Login test successful"
# If failed, check TRACCAR_BASE_URL matches frontend proxy
```

### Issue: Webhook fails

**Cause:** Wrong signing secret or URL
**Solution:**
1. Verify webhook URL in Stripe matches exactly
2. Verify STRIPE_WEBHOOK_SECRET is correct
3. Test with Stripe CLI

### Issue: Plans don't load

**Cause:** Frontend can't reach billing server
**Solution:**
1. Check VITE_BILLING_API_URL is correct
2. Verify billing server is running
3. Check CORS configuration

## 📞 Support Resources

- **Billing Server Deployment:** See BILLING_SERVER_DEPLOYMENT.md
- **Quick Deploy:** See QUICK_DEPLOY.md
- **Full Guide:** See DEPLOYMENT_GUIDE.md

Good luck! 🚀
