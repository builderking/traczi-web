# Stripe Quick Setup - Fix the Payment Error

The error "No such price: 'price_advance_id_here'" happens because your Stripe products haven't been created yet.

## Option 1: Automated Setup (Recommended - 2 minutes)

### Step 1: Get Your Stripe Secret Key

1. Go to https://dashboard.stripe.com/test/apikeys
2. Click "Reveal test key" for the Secret key
3. Copy it (starts with `sk_test_...`)

### Step 2: Update Server .env

Open `server/.env` and update:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
```

### Step 3: Run the Setup Script

```bash
cd server
npm run setup:stripe
```

The script will:
- ✅ Create 3 products in Stripe (Basic, Moderate, Advance)
- ✅ Create prices for each product
- ✅ Display the Price IDs you need

### Step 4: Update .env with Price IDs

Copy the Price IDs from the script output and update `server/.env`:

```env
STRIPE_PRICE_BASIC=price_1234567890abc
STRIPE_PRICE_MODERATE=price_1234567890def
STRIPE_PRICE_ADVANCE=price_1234567890ghi
```

### Step 5: Restart the Server

```bash
npm run dev
```

Done! ✅ Now try registering again.

---

## Option 2: Manual Setup (5 minutes)

### Step 1: Create Products in Stripe Dashboard

Go to: https://dashboard.stripe.com/test/products

#### Create Basic Plan Product

1. Click "Add product"
2. Fill in:
   - **Name:** Basic Plan
   - **Description:** Up to 30 devices with real-time tracking
   - **Pricing model:** Standard pricing
   - **Price:** $20.00
   - **Billing period:** Monthly
3. Click "Save product"
4. **Copy the Price ID** (starts with `price_...`)

#### Create Moderate Plan Product

1. Click "Add product"
2. Fill in:
   - **Name:** Moderate Plan
   - **Description:** Up to 80 devices with advanced features
   - **Pricing model:** Standard pricing
   - **Price:** $40.00
   - **Billing period:** Monthly
3. Click "Save product"
4. **Copy the Price ID**

#### Create Advance Plan Product

1. Click "Add product"
2. Fill in:
   - **Name:** Advance Plan
   - **Description:** Up to 150 devices with all features
   - **Pricing model:** Standard pricing
   - **Price:** $100.00
   - **Billing period:** Monthly
3. Click "Save product"
4. **Copy the Price ID**

### Step 2: Update server/.env

```env
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Replace with actual Price IDs from Stripe
STRIPE_PRICE_BASIC=price_YOUR_BASIC_PRICE_ID
STRIPE_PRICE_MODERATE=price_YOUR_MODERATE_PRICE_ID
STRIPE_PRICE_ADVANCE=price_YOUR_ADVANCE_PRICE_ID
```

### Step 3: Restart Server

```bash
cd server
npm run dev
```

---

## Verify Setup

After completing either option:

1. Go to http://localhost:3000/register
2. Fill in account details
3. Select a plan
4. Click "Complete Registration"
5. You should be redirected to Stripe Checkout ✅

---

## Troubleshooting

### "Invalid API Key"
- Check that your `STRIPE_SECRET_KEY` in `server/.env` is correct
- Make sure there are no extra spaces
- The key should start with `sk_test_` (test mode) or `sk_live_` (production)

### "No such price"
- Make sure Price IDs in `.env` match the ones in Stripe Dashboard
- Price IDs start with `price_` not `prod_`
- Check for typos

### "Webhook signature failed"
- This is normal - the webhook secret is set when you configure webhooks
- For now, you can test checkout without webhooks
- See QUICK_START_SUBSCRIPTION.md for webhook setup

---

## Current Configuration Status

Check your current setup:

```bash
cd server
grep STRIPE .env
```

You should see:
```
STRIPE_SECRET_KEY=sk_test_... (actual key, not placeholder)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_BASIC=price_... (actual Price ID)
STRIPE_PRICE_MODERATE=price_... (actual Price ID)
STRIPE_PRICE_ADVANCE=price_... (actual Price ID)
```

If you see placeholder values like `YOUR_KEY_HERE` or `price_basic_id_here`, you need to update them!

---

## Quick Command Reference

```bash
# Run automated setup
cd server
npm run setup:stripe

# Restart server after configuration
npm run dev

# Check current configuration
cat .env | grep STRIPE

# Test if middleware can connect to Stripe
curl http://localhost:4000/billing/plans
```

---

## Next Steps

Once you've completed the setup:

1. ✅ Test registration with test card `4242 4242 4242 4242`
2. ✅ Set up Stripe webhooks (see QUICK_START_SUBSCRIPTION.md)
3. ✅ Test complete flow end-to-end

Need help? Check the full setup guide: `QUICK_START_SUBSCRIPTION.md`
