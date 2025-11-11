# Quick Start Guide - Subscription Integration

Get your Traczi subscription system up and running in 10 minutes.

## 1. Setup Stripe (5 minutes)

### Create Products in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/products
2. Click "Add product"
3. Create three products:

**Product 1: Basic Plan**
- Name: Basic Plan
- Pricing: $20/month (recurring)
- Click "Save product"
- **Copy the Price ID** (starts with `price_`)

**Product 2: Moderate Plan**
- Name: Moderate Plan
- Pricing: $40/month (recurring)
- Click "Save product"
- **Copy the Price ID**

**Product 3: Advance Plan**
- Name: Advance Plan
- Pricing: $100/month (recurring)
- Click "Save product"
- **Copy the Price ID**

### Get API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy:
   - **Publishable key** (pk_test_...)
   - **Secret key** (sk_test_...) - Click "Reveal test key"

## 2. Configure Middleware (2 minutes)

1. Open `server/.env` in your editor
2. Update these values:

```env
# Paste your Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Paste your Price IDs
STRIPE_PRICE_BASIC=price_YOUR_BASIC_ID
STRIPE_PRICE_MODERATE=price_YOUR_MODERATE_ID
STRIPE_PRICE_ADVANCE=price_YOUR_ADVANCE_ID

# Update Traccar admin credentials
TRACCAR_ADMIN_EMAIL=your_admin@example.com
TRACCAR_ADMIN_PASSWORD=your_password
```

3. Save the file

## 3. Install and Start Middleware (1 minute)

```bash
cd server
npm install
npm run dev
```

You should see:
```
Traczi Billing Middleware started on port 4000
```

Keep this terminal running!

## 4. Setup Stripe Webhook (1 minute)

Open a NEW terminal:

```bash
stripe login
stripe listen --forward-to localhost:4000/webhooks/stripe
```

You should see:
```
Ready! Your webhook signing secret is whsec_...
```

**Copy the webhook secret** (whsec_...) and update `server/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

Restart the middleware (Ctrl+C in server terminal, then `npm run dev` again).

Keep the Stripe CLI running!

## 5. Update Frontend Config (30 seconds)

Open `.env` in the project root and update:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

## 6. Start Frontend (30 seconds)

In a NEW terminal:

```bash
npm start
```

Frontend will start at http://localhost:3000

## 7. Test Registration (1 minute)

1. Go to http://localhost:3000/register
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Next"
4. Select "Moderate Plan" ($40/month)
5. Click "Next"
6. Click "Complete Registration"
7. Use test card:
   - Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
8. Click "Pay"
9. You'll be redirected to success page
10. Wait a few seconds for account creation

## 8. Verify Setup

### Check Middleware Logs
In the middleware terminal, you should see:
```
Received Stripe webhook: checkout.session.completed
Processing checkout completion: cs_...
Successfully created user: test@example.com
```

### Check Stripe CLI
In the Stripe CLI terminal, you should see:
```
[200] POST /webhooks/stripe
```

### Check Traccar
1. Log in to Traccar admin panel (http://35.192.15.228:8082)
2. Go to Settings > Users
3. Find "test@example.com"
4. Verify:
   - ✅ User exists
   - ✅ Device Limit: 80 (Moderate plan)
   - ✅ Account is enabled

### Log in to Traczi
1. Go to http://localhost:3000/login
2. Email: test@example.com
3. Password: password123
4. Click "Login"
5. Go to Settings > Subscription
6. You should see:
   - Current Plan: MODERATE
   - Device Limit: 80 devices
   - Status: ACTIVE

## You're Done! 🎉

Your subscription system is now fully functional!

## What's Running

You should have 3 terminals running:

1. **Frontend** (`npm start`) - Port 3000
2. **Middleware** (`npm run dev`) - Port 4000
3. **Stripe CLI** (`stripe listen`) - Webhook forwarding

## Next Steps

### Test Other Plans
Try registering with different plans to verify they work:
- Basic ($20) → 30 devices
- Moderate ($40) → 80 devices
- Advance ($100) → 150 devices

### Test Subscription Management
1. Log in to Traczi
2. Go to Settings > Subscription
3. Click "Manage Subscription"
4. Test:
   - Update payment method
   - View invoices
   - Change plan
   - Cancel subscription

### Test Webhook Events
Try these scenarios:
- Cancel a subscription in Stripe Dashboard
- Change subscription plan
- Let a payment fail (use card `4000 0000 0000 0341`)

Watch the middleware logs to see webhook handling.

## Common Issues

### "Webhook signature verification failed"
- Make sure you copied the webhook secret correctly
- Restart the middleware after updating `.env`
- Make sure Stripe CLI is running

### "Traccar authentication failed"
- Check admin credentials in `server/.env`
- Verify Traccar server is accessible
- Check `TRACCAR_BASE_URL` is correct

### "Failed to create checkout session"
- Verify Price IDs are correct in `server/.env`
- Check middleware logs for errors
- Ensure middleware is running on port 4000

### "User not created after payment"
- Check middleware logs
- Verify webhook is being received
- Check Stripe CLI output
- Verify Traccar admin has permissions

## Need Help?

Check the full documentation:
- `SUBSCRIPTION_SETUP.md` - Complete setup guide
- `server/README.md` - Middleware documentation

View logs:
- Middleware: `server/logs/combined.log`
- Browser: Open DevTools Console

## Test Cards

Stripe provides many test cards:

| Card Number         | Result                |
|---------------------|-----------------------|
| 4242 4242 4242 4242 | Success               |
| 4000 0000 0000 0002 | Card declined         |
| 4000 0000 0000 9995 | Insufficient funds    |
| 4000 0000 0000 0341 | Charge succeeds, customer.subscription.created fails |

More test cards: https://stripe.com/docs/testing

## Production Checklist

Before going live:

- [ ] Create live Stripe products and get live Price IDs
- [ ] Switch to live Stripe API keys
- [ ] Register production webhook endpoint in Stripe
- [ ] Deploy middleware to server with HTTPS
- [ ] Update all URLs to production domains
- [ ] Set `NODE_ENV=production`
- [ ] Test complete flow in production
- [ ] Set up monitoring and alerts
- [ ] Document emergency procedures

See `SUBSCRIPTION_SETUP.md` Part 8 for detailed production deployment instructions.
