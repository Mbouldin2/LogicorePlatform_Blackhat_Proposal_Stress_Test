# Stripe Integration - Migration Prompt

Use this prompt to migrate the full Stripe payment integration from the SVP Platform into another SVP white-label Next.js site.

---

## Migration Prompt

```
I need to migrate the complete Stripe payment integration from an existing SVP Platform (Next.js 16 / App Router / TypeScript / Firebase) into my white-label SVP site. The integration covers:

1. Admin test/config panel (test vs live mode toggle)
2. One-time payment intents (for testing)
3. Subscription setup flow (for agreement/proposal-based recurring billing)
4. Webhook handler

---

### TECH STACK (source and target must match):
- Next.js 16+ with App Router
- TypeScript (strict mode)
- Firebase / Firestore (firebase-admin for server-side)
- Stripe SDK v20+ (stripe, @stripe/react-stripe-js, @stripe/stripe-js)
- shadcn/ui components (Button, Card, Badge, Switch, Alert, Input, Label, Separator)
- Tailwind CSS
- sonner (toast notifications)
- lucide-react (icons)

---

### FILES TO COPY (exact paths from source repo):

#### API Routes — copy to `app/api/stripe/`
1. `app/api/stripe/config/route.ts`
   - GET: reads Stripe mode (test|live) from Firestore `platformSettings/stripe_config`
   - POST: saves mode to Firestore
   - Uses: `adminDb` from `@/lib/firebase-admin`

2. `app/api/stripe/create-payment-intent/route.ts`
   - POST: creates a Stripe PaymentIntent using the correct key for the active mode
   - Body: `{ amount: number (cents), currency?: string, description?: string, mode?: "test"|"live" }`
   - Returns: `{ clientSecret, paymentIntentId, amount, currency, status }`

3. `app/api/stripe/create-setup-intent/route.ts`
   - POST: creates a Stripe Customer + SetupIntent for recurring billing
   - Body: `{ customerEmail: string, customerName?: string, signatureId: string }`
   - Returns: `{ success, clientSecret, customerId }`
   - Side effect: stores customer/setup data in Firestore

4. `app/api/stripe/confirm-subscription/route.ts`
   - POST: attaches payment method, creates Product + Price + Subscription
   - Body: `{ paymentMethodId, customerEmail, customerName, monthlyAmount, agreementName, signatureId }`
   - Returns: `{ success, subscriptionId, customerId, status }`
   - Side effect: updates `COLLECTIONS.PROPOSAL_SIGNATURES` doc in Firestore with subscription info

5. `app/api/stripe/webhook/route.ts`
   - POST: Stripe webhook handler (verifies signature, handles payment_intent.succeeded, subscription events)
   - Requires: `STRIPE_WEBHOOK_SECRET` env var

#### Pages — copy to target locations
6. `app/(portal)/portal/admin/stripe-test/page.tsx`
   - Admin panel at `/portal/admin/stripe-test`
   - Features: mode toggle (test/live), key status display, payment intent creation, embedded payment form, test card reference
   - Requires: portal layout with admin-only access

7. `app/payment/setup/page.tsx`
   - Public-facing subscription setup page at `/payment/setup`
   - URL params: `?signatureId=&email=&name=&amount=&agreement=`
   - Flow: creates SetupIntent → CardElement form → confirm → create subscription → redirect to `/payment/success`
   - No portal layout needed (standalone page)

---

### ENVIRONMENT VARIABLES REQUIRED:

Add to `.env.local` (and Vercel/hosting environment variables):

```env
# Test mode Stripe keys (from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY_TEST=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...

# Live mode Stripe keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY_LIVE=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...

# Legacy fallback (used by create-setup-intent and confirm-subscription)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook secret (from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### FIRESTORE DEPENDENCIES:

The integration reads/writes these Firestore collections. Ensure they exist or adjust collection names to match your schema:

| Collection | Document | Fields Written |
|---|---|---|
| `platformSettings` | `stripe_config` | `mode` ("test"\|"live"), `updatedAt` |
| `COLLECTIONS.PROPOSAL_SIGNATURES` | `{signatureId}` | `stripeCustomerId`, `stripeSubscriptionId`, `stripePaymentMethodId`, `subscriptionStatus`, `subscriptionCreatedAt`, `updatedAt` |

`COLLECTIONS.PROPOSAL_SIGNATURES` must be defined in `@/lib/schema.ts`. If your schema uses a different collection name, update `confirm-subscription/route.ts` line referencing `COLLECTIONS.PROPOSAL_SIGNATURES`.

---

### SIDEBAR NAVIGATION (admin only):

Add this entry to `systemSettingsItems` in `components/portal/portal-sidebar.tsx`:

```typescript
{
  title: "Stripe Integration",
  href: "/portal/admin/stripe-test",
  icon: CreditCard,
  badge: "PAY",
},
```

Also add `CreditCard` to the lucide-react import in that file.

---

### DEPENDENCIES (verify these are in `package.json`):

```json
"stripe": "^20.3.1",
"@stripe/react-stripe-js": "^5.6.0",
"@stripe/stripe-js": "^8.7.0"
```

Install if missing:
```bash
npm install stripe @stripe/react-stripe-js @stripe/stripe-js
```

---

### STRIPE DASHBOARD SETUP:

1. **Webhook endpoint** — Register in [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks):
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET`

2. **Test mode** — Use test keys during development. The admin panel toggle at `/portal/admin/stripe-test` switches between test and live mode globally (stored in Firestore).

---

### BRANDING CUSTOMIZATION:

The following hardcoded brand colors appear in the payment pages — replace with your white-label brand colors:

| File | Current Value | Replace With |
|---|---|---|
| `app/payment/setup/page.tsx` | `#1e3a5f` (navy) | Your primary color |
| `app/payment/setup/page.tsx` | `#2d5a8f` (blue gradient) | Your secondary color |
| `app/payment/setup/page.tsx` | `#C8A951` (gold) | Your accent color |
| `app/(portal)/portal/admin/stripe-test/page.tsx` | `#1e3a5f` | Your primary color |

---

### PAYMENT FLOWS INCLUDED:

**Flow 1 — One-Time Payment Test (Admin only)**
```
/portal/admin/stripe-test
  → Enter amount + description
  → POST /api/stripe/create-payment-intent
  → Stripe PaymentElement form
  → Confirm payment
  → Show success/failure result
```

**Flow 2 — Subscription Setup (Customer-facing)**
```
/payment/setup?signatureId=X&email=Y&name=Z&amount=A&agreement=B
  → POST /api/stripe/create-setup-intent  (creates Stripe Customer + SetupIntent)
  → CardElement form (save payment method)
  → stripe.confirmCardSetup()
  → POST /api/stripe/confirm-subscription  (creates Product + Price + Subscription)
  → Redirect to /payment/success?signatureId=X
```

---

### STRIPE API VERSION:

All routes use `apiVersion: "2026-01-28.clover"` — this matches `stripe@20.x`. Do not change this unless you upgrade/downgrade the Stripe SDK.

---

### VERIFICATION CHECKLIST:

After migration, verify the following:

- [ ] `npm run build` passes with no TypeScript errors
- [ ] `/portal/admin/stripe-test` loads and shows key status
- [ ] Mode toggle (test/live) saves to Firestore and persists on reload
- [ ] Creating a payment intent with amount $1.00 returns a `clientSecret`
- [ ] Test card `4242 4242 4242 4242` (any future expiry, any CVC) succeeds
- [ ] Test card `4000 0000 0000 9995` is declined as expected
- [ ] `/payment/setup?signatureId=test&email=test@test.com&name=Test&amount=99&agreement=TestAgreement` loads without error
- [ ] Webhook endpoint returns `{ received: true }` for test events from Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  stripe trigger payment_intent.succeeded
  ```

---

### SOURCE REPOSITORY:

**Platform:** https://github.com/brianstittsr/windsurf_SVP_VPlusPlatform

Clone and reference the full implementation. All Stripe files are under:
- `app/api/stripe/` — API routes
- `app/(portal)/portal/admin/stripe-test/` — Admin test page
- `app/payment/setup/` — Customer subscription setup page
```

---

## Quick Reference — Stripe API Routes

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/api/stripe/config` | GET | Get current mode (test/live) | Admin |
| `/api/stripe/config` | POST | Set mode (test/live) | Admin |
| `/api/stripe/create-payment-intent` | POST | Create one-time payment intent | Admin |
| `/api/stripe/create-setup-intent` | POST | Create customer + setup intent for subscription | Public |
| `/api/stripe/confirm-subscription` | POST | Attach payment method + create subscription | Public |
| `/api/stripe/webhook` | POST | Stripe event webhook handler | Stripe |

---

## Test Card Numbers

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0002` | Declined (generic) |
| `4000 0000 0000 3220` | 3D Secure required |

Use any future expiry date, any 3-digit CVC, any ZIP code.
