# Traczi Subscription Integration Setup Guide

This guide will walk you through setting up the complete subscription integration for Traczi, including Stripe billing and Traccar user provisioning.

## Overview

The subscription system consists of three main components:

1. **Frontend (React)** - Registration flow with plan selection
2. **Billing Middleware (Node/Express)** - Stripe integration and webhook handling
3. **Traccar Backend** - User provisioning and device limit management

## Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- Stripe account (test or live)
- Traccar server running and accessible
- Admin credentials for Traccar

## Part 1: Stripe Configuration

### 1.1 Create Stripe Products and Prices

You need to create three subscription products in your Stripe Dashboard:

#### Basic Plan
- Name: Basic Plan
- Price: $20/month
- Description: Up to 30 devices

#### Moderate Plan
- Name: Moderate Plan
- Price: $40/month
- Description: Up to 80 devices

#### Advance Plan
- Name: Advance Plan
- Price: $100/month
- Description: Up to 150 devices

### 1.2 Get Price IDs

After creating the products, copy the Price IDs (they start with `price_`). You'll need these for the middleware configuration.

### 1.3 Get API Keys

From Stripe Dashboard > Developers > API keys:
- Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
- Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

## Part 2: Middleware Setup

### 2.1 Install Dependencies

```bash
cd server
npm install
```

### 2.2 Configure Environment Variables

Create `server/.env` from the example:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your configuration:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (from Step 1.2)
STRIPE_PRICE_BASIC=price_1234567890basic
STRIPE_PRICE_MODERATE=price_1234567890moderate
STRIPE_PRICE_ADVANCE=price_1234567890advance

# Traccar Configuration
TRACCAR_BASE_URL=http://35.192.15.228:8082
TRACCAR_ADMIN_EMAIL=your_admin_email@example.com
TRACCAR_ADMIN_PASSWORD=your_admin_password

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
SUCCESS_URL=http://localhost:3000/registration-success
CANCEL_URL=http://localhost:3000/register

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000
```

### 2.3 Start the Middleware

```bash
cd server
npm run dev
```

The middleware will start on port 4000. You should see:

```
Traczi Billing Middleware started on port 4000
Environment: development
Traccar API: http://35.192.15.228:8082
Frontend URL: http://localhost:3000
```

## Part 3: Stripe Webhook Setup

### 3.1 Install Stripe CLI (for development)

Download and install Stripe CLI from: https://stripe.com/docs/stripe-cli

### 3.2 Login to Stripe

```bash
stripe login
```

### 3.3 Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:4000/webhooks/stripe
```

You should see output like:

```
> Ready! Your webhook signing secret is whsec_1234567890abcdef (^C to quit)
```

### 3.4 Update Webhook Secret

Copy the webhook signing secret (starts with `whsec_`) and update it in `server/.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
```

Restart the middleware server after updating the webhook secret.

### 3.5 Production Webhook Setup

For production, register your webhook in Stripe Dashboard:

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. URL: `https://your-domain.com/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Copy the signing secret and update your production `.env`

## Part 4: Frontend Setup

### 4.1 Update Frontend Environment

The frontend `.env` file has been updated with:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_BILLING_API_URL=http://localhost:4000
```

Update these values with your actual Stripe publishable key.

### 4.2 Start the Frontend

```bash
npm start
```

The frontend will start on port 3000.

## Part 5: Testing the Complete Flow

### 5.1 Registration Flow Test

1. Navigate to http://localhost:3000/register
2. Fill in account details (name, email, password)
3. Click "Next" to proceed to plan selection
4. Select a subscription plan (Basic, Moderate, or Advance)
5. Click "Next" to review
6. Click "Complete Registration"
7. You'll be redirected to Stripe Checkout
8. Use test card: `4242 4242 4242 4242`
   - Use any future expiry date
   - Use any 3-digit CVC
   - Use any 5-digit ZIP code
9. Complete the payment
10. You'll be redirected back to the success page
11. Your account will be created in Traccar automatically

### 5.2 Verify in Traccar

1. Log in to Traccar admin panel
2. Go to Users
3. Find the newly created user
4. Verify:
   - Device limit matches the selected plan
   - User is enabled
   - User attributes contain subscription metadata

### 5.3 Test Subscription Management

1. Log in to Traczi with the new account
2. Navigate to Settings > Subscription
3. Click "Manage Subscription"
4. You'll be redirected to Stripe Customer Portal
5. Test updating payment method, viewing invoices, etc.

## Part 6: Plan Details

The system supports three subscription tiers:

| Plan     | Price/Month | Device Limit | Features                                    |
|----------|-------------|--------------|---------------------------------------------|
| Basic    | $20         | 30           | Real-time tracking, Basic reports, Email support |
| Moderate | $40         | 80           | All Basic + Advanced reports, Geofencing, Priority support |
| Advance  | $100        | 150          | All Moderate + API access, 24/7 support    |

Plans are configured in `server/config/plans.js` and can be customized as needed.

## Part 7: Webhook Event Handling

The middleware handles the following Stripe events:

### checkout.session.completed
- Triggered when user completes payment
- Creates or updates user in Traccar
- Sets initial device limit
- Stores subscription metadata

### customer.subscription.created
- Confirms subscription activation
- Updates device limit
- Enables user account

### customer.subscription.updated
- Handles plan changes
- Updates device limit
- Manages subscription status changes

### customer.subscription.deleted
- Handles cancellations
- Disables user account
- Sets device limit to 0

### invoice.payment_failed
- Tracks payment failures
- Updates subscription status
- Optionally disables account after grace period

### invoice.payment_succeeded
- Confirms successful payments
- Reactivates account if previously disabled
- Updates payment metadata

## Part 8: Production Deployment

### 8.1 Middleware Deployment

1. Deploy the middleware to a server with HTTPS
2. Update environment variables for production:
   - Use live Stripe keys
   - Set `NODE_ENV=production`
   - Update URLs to production domains
3. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server/index.js --name traczi-billing
pm2 startup
pm2 save
```

### 8.2 Frontend Deployment

1. Update frontend `.env` with production URLs
2. Build the frontend:

```bash
npm run build
```

3. Deploy the `build/` directory to your web server

### 8.3 Stripe Webhook

1. Register production webhook endpoint in Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in production environment
3. Test webhook delivery in Stripe Dashboard

## Part 9: Monitoring and Maintenance

### 9.1 Logs

Middleware logs are stored in `server/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

Monitor these files for issues:

```bash
tail -f server/logs/combined.log
```

### 9.2 Stripe Dashboard

Monitor in Stripe Dashboard:
- Payments
- Subscriptions
- Webhook delivery
- Failed payments

### 9.3 Traccar Verification

Regularly verify:
- User device limits match subscription plans
- Disabled users have canceled subscriptions
- Subscription metadata is up to date

## Troubleshooting

### Webhook Signature Verification Failed

**Problem:** Webhook signature verification fails

**Solution:**
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook is sending raw body (not parsed JSON)
- Check Stripe webhook logs for errors

### User Not Created After Payment

**Problem:** Payment succeeds but user not created in Traccar

**Solution:**
- Check middleware logs for errors
- Verify Traccar admin credentials
- Check Traccar API accessibility
- Verify webhook is being received

### Device Limit Not Updating

**Problem:** Device limit doesn't match subscription plan

**Solution:**
- Check webhook event is being processed
- Verify plan configuration in `server/config/plans.js`
- Check Traccar API permissions
- Review middleware logs for API errors

### Checkout Fails

**Problem:** Error when creating checkout session

**Solution:**
- Verify Stripe Price IDs are correct
- Check middleware is running
- Verify CORS settings allow frontend origin
- Check middleware logs for errors

## Security Considerations

1. **Never expose secret keys** - Keep Stripe secret keys server-side only
2. **Verify webhook signatures** - Always verify Stripe webhook signatures
3. **Use HTTPS in production** - Required for Stripe webhooks
4. **Rate limiting** - Middleware includes rate limiting for all endpoints
5. **Input validation** - All inputs are validated before processing
6. **Secure Traccar credentials** - Store admin credentials securely

## Support

For issues or questions:
- Check middleware logs in `server/logs/`
- Review Stripe Dashboard for webhook delivery
- Verify Traccar API responses
- Check browser console for frontend errors

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Traccar API Documentation](https://www.traccar.org/api-reference/)
