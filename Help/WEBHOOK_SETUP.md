# Quick Webhook Setup - Fix Login Issue

## The Problem
You completed payment but can't log in because **webhooks aren't running**. Webhooks create your user account in Traccar after payment.

## Fix in 3 Steps (2 minutes)

### Step 1: Install Stripe CLI

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
Download from: https://github.com/stripe/stripe-cli/releases/latest

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin
```

### Step 2: Login & Start Forwarding

```bash
# Login (opens browser)
stripe login

# Start webhook forwarding (keep this terminal open!)
stripe listen --forward-to localhost:4000/webhooks/stripe
```

You'll see:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy the `whsec_...` secret!**

### Step 3: Update .env & Restart

1. Open `server/.env`
2. Replace:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```
   With your actual secret:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

3. Restart middleware:
   ```bash
   # In middleware terminal: Ctrl+C, then:
   npm run dev
   ```

### Step 4: Test Registration Again

1. Go to http://localhost:3000/register
2. Use a NEW email (not the ones you tried before)
3. Complete registration
4. Pay with test card: `4242 4242 4242 4242`
5. Wait 3-5 seconds after payment
6. Try logging in!

## What You Should See

In the Stripe CLI terminal, after payment you'll see:
```
2025-11-11 08:50:00  --> checkout.session.completed [evt_xxx]
2025-11-11 08:50:01  <-- [200] POST /webhooks/stripe
```

In the middleware terminal:
```
Received Stripe webhook: checkout.session.completed
Processing checkout completion: cs_test_xxx
Successfully created user: email@example.com
```

## Fix Your Previous Registration Attempts

For the emails you already tried (that can't log in), you have 2 options:

### Option A: Use Different Emails
Just register with new email addresses. The old ones didn't create accounts.

### Option B: Manually Create Accounts in Traccar
1. Go to Traccar admin panel: http://35.192.15.228:8082
2. Login as admin
3. Go to Settings > Users > Add User
4. Create accounts for:
   - gauravpawar12904@gmail.com
   - gaurav124@builderking.io
5. Set Device Limit based on plan they paid for

## Troubleshooting

### "stripe: command not found"
- Stripe CLI isn't installed. Follow Step 1 above.

### "Webhook signature verification failed"
- Wrong webhook secret in `.env`
- Make sure you copied the `whsec_...` exactly
- Restart the middleware server

### "User already exists" in logs
- The user was created! Try logging in.
- Check Traccar admin panel to verify.

### Webhook terminal shows errors
- Check middleware logs: `tail -f server/logs/combined.log`
- Check Traccar is accessible: `curl http://35.192.15.228:8082`

## Keep These Running

For local development, you need **3 terminals**:

1. **Frontend**: `npm start` (port 3000)
2. **Middleware**: `cd server && npm run dev` (port 4000)
3. **Stripe CLI**: `stripe listen --forward-to localhost:4000/webhooks/stripe`

All 3 must be running for registration to work!

## Production Setup

For production, you don't use Stripe CLI. Instead:

1. Deploy middleware to a server with HTTPS
2. Register webhook in Stripe Dashboard:
   - Go to: https://dashboard.stripe.com/webhooks
   - Add endpoint: https://your-domain.com/webhooks/stripe
   - Select events:
     - checkout.session.completed
     - customer.subscription.created
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.payment_failed
     - invoice.payment_succeeded
3. Copy the webhook signing secret to production `.env`

## Quick Test Checklist

- [ ] Stripe CLI installed
- [ ] `stripe login` completed
- [ ] `stripe listen` running (see "Ready!" message)
- [ ] Webhook secret copied to `server/.env`
- [ ] Middleware restarted
- [ ] Test registration with NEW email
- [ ] Check Stripe CLI shows webhook received
- [ ] Check middleware logs show user created
- [ ] Can log in successfully

Once all checked, registration will work perfectly! 🎉
