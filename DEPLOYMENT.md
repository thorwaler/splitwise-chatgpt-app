# Splitwise ChatGPT App - Deployment Guide

## 🚀 Deploy to Vercel via GitHub

Follow these steps to deploy your Splitwise ChatGPT App to Vercel using GitHub.

---

## Prerequisites

Before deploying, you need accounts for:

1. **GitHub** - To host your code
2. **Vercel** - To deploy the app (free tier works!)
3. **Upstash** - Redis database (free tier works!)
4. **Splitwise Developer** - OAuth credentials
5. **Stripe** - Payment processing (test mode is free)

---

## Step 1: Create Required Accounts

### 1.1 Upstash (Redis Database)

1. Go to https://upstash.com
2. Sign up for free account
3. Create a new Redis database
4. Copy your credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### 1.2 Splitwise Developer App

1. Go to https://secure.splitwise.com/apps
2. Click "Register your application"
3. Fill in:
   - **Name**: Splitwise ChatGPT App
   - **Homepage**: https://your-app.vercel.app (you'll update this later)
   - **Callback URL**: https://your-app.vercel.app/api/auth/splitwise/callback
   - **Description**: Track expenses in Splitwise through ChatGPT
4. Copy your credentials:
   - `SPLITWISE_CLIENT_ID`
   - `SPLITWISE_CLIENT_SECRET`

### 1.3 Stripe (Payment Processing)

1. Go to https://stripe.com
2. Sign up for free account
3. Use **Test Mode** for development
4. Go to Developers → API Keys
5. Copy your credentials:
   - `STRIPE_SECRET_KEY` (starts with sk_test_...)
   - `STRIPE_PUBLISHABLE_KEY` (starts with pk_test_...)
6. **Note**: You'll configure webhook secret after deployment

### 1.4 Generate Secret Keys

Run these commands to generate secure random keys:

```bash
# JWT Secret (32+ characters)
openssl rand -base64 32

# Encryption Key (32+ characters)
openssl rand -base64 32
```

Save these as:
- `JWT_SECRET`
- `ENCRYPTION_KEY`

---

## Step 2: Push to GitHub

### 2.1 Extract the Zip File

```bash
unzip splitwise-chatgpt-app.zip
cd splitwise-chatgpt-app
```

### 2.2 Initialize Git Repository

```bash
git init
git add .
git commit -m "Initial commit: Splitwise ChatGPT App"
```

### 2.3 Create GitHub Repository

1. Go to https://github.com
2. Click "New repository"
3. Name it: `splitwise-chatgpt-app`
4. **Do NOT** initialize with README (we already have one)
5. Click "Create repository"

### 2.4 Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/splitwise-chatgpt-app.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to https://vercel.com
2. Sign up / Log in (use GitHub account)
3. Click "Add New..." → "Project"
4. Import your `splitwise-chatgpt-app` repository
5. Click "Import"

### 3.2 Configure Project

**Framework Preset:** Next.js (should auto-detect)
**Root Directory:** `./` (leave default)
**Build Command:** `next build` (leave default)
**Output Directory:** `.next` (leave default)

Click "Deploy" (it will fail initially - that's OK, we need to add environment variables)

### 3.3 Add Environment Variables

1. Go to your project settings
2. Navigate to "Settings" → "Environment Variables"
3. Add ALL of the following variables:

**Database:**
```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX...
```

**Security:**
```
JWT_SECRET=your-32-char-secret-from-openssl
ENCRYPTION_KEY=your-32-char-key-from-openssl
```

**Splitwise OAuth:**
```
SPLITWISE_CLIENT_ID=your_client_id
SPLITWISE_CLIENT_SECRET=your_client_secret
SPLITWISE_OAUTH_REDIRECT_URL=https://your-app.vercel.app/api/auth/splitwise/callback
```
**Note**: Replace `your-app.vercel.app` with your actual Vercel URL (you'll get this after first deployment)

**Stripe:**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
**Note**: We'll add STRIPE_WEBHOOK_SECRET after configuring the webhook

**App Configuration:**
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_PRICE_AMOUNT=99
NEXT_PUBLIC_PRICE_CURRENCY=USD
NEXT_PUBLIC_ORIGINAL_PRICE=999
NEXT_PUBLIC_FREE_MESSAGE_LIMIT=3
```

**Important**: Set these for **Production**, **Preview**, and **Development** environments

### 3.4 Redeploy

1. Go to "Deployments" tab
2. Click "..." on the latest deployment
3. Click "Redeploy"
4. Wait for deployment to complete

### 3.5 Get Your Vercel URL

After successful deployment, you'll get a URL like:
```
https://splitwise-chatgpt-app-abc123.vercel.app
```

Save this URL - you'll need it for the next steps!

---

## Step 4: Update External Services

### 4.1 Update Splitwise App

1. Go back to https://secure.splitwise.com/apps
2. Edit your app
3. Update **Callback URL**: `https://your-actual-vercel-url.vercel.app/api/auth/splitwise/callback`
4. Update **Homepage**: `https://your-actual-vercel-url.vercel.app`
5. Save changes

### 4.2 Update Vercel Environment Variables

1. Go to Vercel → Settings → Environment Variables
2. Update these variables with your actual Vercel URL:
   - `SPLITWISE_OAUTH_REDIRECT_URL`
   - `NEXT_PUBLIC_APP_URL`
3. Redeploy again

### 4.3 Configure Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-actual-vercel-url.vercel.app/api/stripe/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"
6. **Copy the Webhook Signing Secret** (starts with `whsec_...`)
7. Add to Vercel environment variables:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...`
8. Redeploy one final time

---

## Step 5: Build the Widget

The widget needs to be built before the app will work fully.

### Option A: Build Locally and Push

```bash
# In your local project
npm install
npm run build:widget

# Commit and push
git add public/
git commit -m "Add built widget files"
git push
```

Vercel will auto-deploy the changes.

### Option B: Add Build Script to Vercel

1. In your project, edit `package.json`
2. Update the build script:
   ```json
   "scripts": {
     "build": "npm run build:widget && next build"
   }
   ```
3. Commit and push
4. Vercel will build the widget automatically

---

## Step 6: Test Your Deployment

### 6.1 Test MCP Server

```bash
# Install test dependencies locally
npm install

# Test your deployed server
MCP_URL=https://your-actual-vercel-url.vercel.app npm run test:mcp
```

Expected output:
```
🎉 All tests passed!
```

### 6.2 Test Web Interface

Visit: `https://your-actual-vercel-url.vercel.app`

You should see the landing page.

### 6.3 Test Widget

Visit: `https://your-actual-vercel-url.vercel.app/api/mcp?resource=widget`

You should see the widget HTML.

### 6.4 Test MCP Endpoint

```bash
curl https://your-actual-vercel-url.vercel.app/api/mcp
```

Should return server info JSON.

---

## Step 7: Register with ChatGPT

### 7.1 Update Manifest

1. Edit `chatgpt-app.json`
2. Update the URL:
   ```json
   {
     "api": {
       "type": "mcp",
       "url": "https://your-actual-vercel-url.vercel.app/api/mcp"
     }
   }
   ```
3. Commit and push

### 7.2 Register in ChatGPT

1. Go to ChatGPT
2. Open Settings
3. Navigate to "Apps" or "Beta Features"
4. Click "Develop your own app"
5. Select "MCP Server"
6. Enter your URL: `https://your-actual-vercel-url.vercel.app/api/mcp`
7. Test the connection
8. Authorize the app

### 7.3 Test with ChatGPT

Try these commands:

```
"Connect my Splitwise account"
"What are my Splitwise groups?"
"Add $50 for groceries"
"Show me my spending this month"
```

---

## Troubleshooting

### Issue: Deployment Fails

**Solution**: Check Vercel build logs
- Go to Deployments → Click failed deployment → View logs
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Missing dependencies

### Issue: Widget Not Found

**Solution**: Build the widget
```bash
npm run build:widget
git add public/
git commit -m "Add widget build"
git push
```

### Issue: OAuth Redirect Fails

**Solution**: Check callback URL
- Vercel URL must match exactly in:
  - Splitwise app settings
  - `SPLITWISE_OAUTH_REDIRECT_URL` environment variable
- No trailing slashes!

### Issue: Payment Webhook Fails

**Solution**: Check webhook secret
- Stripe webhook secret must be correct
- Test in Stripe Dashboard → Webhooks → Send test webhook

### Issue: Tools Not Appearing in ChatGPT

**Solution**: Test MCP endpoint
```bash
curl -X POST https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Should return 9 tools. If not, check:
- Environment variables are set
- Build completed successfully
- No errors in Vercel logs

---

## Environment Variables Quick Reference

```bash
# Database
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Security
JWT_SECRET=
ENCRYPTION_KEY=

# Splitwise
SPLITWISE_CLIENT_ID=
SPLITWISE_CLIENT_SECRET=
SPLITWISE_OAUTH_REDIRECT_URL=https://your-app.vercel.app/api/auth/splitwise/callback

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App Config
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_PRICE_AMOUNT=99
NEXT_PUBLIC_PRICE_CURRENCY=USD
NEXT_PUBLIC_ORIGINAL_PRICE=999
NEXT_PUBLIC_FREE_MESSAGE_LIMIT=3
```

---

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Splitwise callback URL updated
- [ ] Stripe webhook configured
- [ ] Widget built and committed
- [ ] MCP tests passing
- [ ] ChatGPT app registered
- [ ] OAuth flow tested
- [ ] Payment flow tested
- [ ] Analytics working

---

## Going Live (Production)

### Switch Stripe to Live Mode

1. Go to Stripe Dashboard
2. Toggle from "Test Mode" to "Live Mode"
3. Get new API keys from Developers → API Keys
4. Update Vercel environment variables:
   - `STRIPE_SECRET_KEY` (sk_live_...)
   - `STRIPE_PUBLISHABLE_KEY` (pk_live_...)
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_live_...)
5. Create new webhook endpoint (same events)
6. Update `STRIPE_WEBHOOK_SECRET`
7. Redeploy

### Custom Domain (Optional)

1. In Vercel, go to Settings → Domains
2. Add your custom domain
3. Update DNS records as shown
4. Update environment variables with new domain
5. Update Splitwise callback URL
6. Update Stripe webhook URL
7. Redeploy

---

## Support

**Documentation**: See all PHASE-*-COMPLETE.md files  
**Test Suite**: `npm run test:mcp`  
**Logs**: Vercel Dashboard → Deployments → Function Logs  

---

## Success! 🎉

Your Splitwise ChatGPT App is now deployed and ready to use!

**What works:**
- ✅ User registration
- ✅ Splitwise OAuth
- ✅ Expense tracking
- ✅ Analytics
- ✅ Payment processing
- ✅ ChatGPT integration

**Next steps:**
- Share with friends
- Monitor usage in Vercel
- Check Stripe payments
- Enjoy tracking expenses naturally!

---

Built with ❤️ using Next.js, React, and Model Context Protocol
