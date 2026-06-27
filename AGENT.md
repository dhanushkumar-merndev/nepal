# AGENTS.md — OTT Subscriptions Nepal Production MVP

## Project Goal

Build a clean, premium, professional OTT/digital services marketplace for **OTT Subscriptions Nepal**.

The website must support:

```txt
Public landing page
Product/service listing
Nested plans per product
Real price + offer price
Stock status
Add to cart
WhatsApp checkout
Google login for reviews
Admin panel
Supabase database
Supabase Storage images
30 requests/minute rate limit
Strong security headers
Vercel deployment
```

Use the existing logo:

```txt
/public/logo.png
```

Use this background texture URL directly:

```css
background-color: #e6e6e6;
background-image: url("https://www.transparenttextures.com/patterns/arches.png");
```

---

## Tech Stack

Use:

```txt
Next.js 15 or 16
TypeScript
App Router
Tailwind CSS
shadcn/ui
Framer Motion
GSAP
Supabase Auth
Supabase Postgres
Supabase Storage
Zod
React Hook Form
Zustand
Lucide React
Sonner Toast
Upstash Redis for rate limit
Vercel
```

Use Server Components by default.

Use Client Components only for:

```txt
Cart
Forms
Filters
Dialogs
Sheets
Animations
Google login buttons
Admin interactive forms
WhatsApp checkout
```

---

## shadcn/ui Components

Install and use:

```txt
button
card
badge
sheet
dialog
tabs
accordion
input
textarea
select
form
dropdown-menu
table
toast / sonner
separator
avatar
label
switch
checkbox
skeleton
alert
radio-group
```

---

## Brand Design

The design must be:

```txt
White/light gray
Paper texture background
Premium card layout
Black text
Ocean blue accent
Clean ecommerce style
Mobile responsive
Fast loading
Professional
```

Avoid a dark Netflix-style layout.

### Colors

```txt
Background: #e6e6e6
Card background: rgba(255,255,255,0.84)
Text primary: #111111
Text secondary: #555555
Muted text: #737373
Border: rgba(0,0,0,0.08)
Primary blue: #159FD3
Dark blue: #0B7FAE
Light blue: #E6F7FD
Success green: #16A34A
Warning orange: #F59E0B
Danger red: #DC2626
```

### Global Background

```css
body {
  background-color: #e6e6e6;
  background-image: url("https://www.transparenttextures.com/patterns/arches.png");
  color: #111111;
}
```

### Premium Card Style

```css
.premium-card {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(12px);
}
```

### Primary Button

```css
.primary-btn {
  background: linear-gradient(135deg, #159fd3, #0b7fae);
  color: white;
  border-radius: 999px;
}
```

---

## Font

Use:

```txt
Geist Sans
```

Fallback:

```txt
Inter
Plus Jakarta Sans
sans-serif
```

---

## Main Pages

Create:

```txt
/
 /services
 /cart
 /reviews
 /contact
 /admin
 /admin/login
 /admin/products
 /admin/orders
 /admin/reviews
 /admin/feedback
 /admin/settings
```

---

## Public Landing Page

Homepage `/` must include:

```txt
Sticky Header
Hero Section
Trust Badges
Featured Services
All Services Grid
How It Works
Reviews
FAQ
Feedback Footer
WhatsApp CTA
```

---

## Header

Create a sticky glass header.

Left:

```txt
Logo from /public/logo.png
```

Navigation:

```txt
Home
Services
Reviews
How It Works
FAQ
Contact
```

Right side:

```txt
Cart icon with count
WhatsApp Order button
Google login/avatar button if user is logged in
```

Mobile:

```txt
Use shadcn Sheet hamburger menu
```

Header style:

```txt
Sticky top
Backdrop blur
White transparent background
Soft border bottom
Logo left
Rounded CTA
```

---

## Hero Section

Hero title:

```txt
Premium OTT Subscriptions in Nepal
```

Hero subtitle:

```txt
Netflix, Spotify, Prime Video, YouTube Premium and more — easy activation, fast support, and simple WhatsApp checkout.
```

Hero buttons:

```txt
Explore Plans
Order on WhatsApp
```

Hero floating cards:

```txt
Netflix
Spotify Premium
Prime Video
YouTube Premium
```

Trust badges:

```txt
Fast Activation
Nepal Support
Easy Renewal
Secure Checkout
```

Use Framer Motion fade-up and stagger animation.

Use GSAP only for subtle rotating text or blue wave motion.

---

## Product Categories

Support:

```txt
OTT & Streaming
Music
Gaming
Social Growth
```

Initial products admin can create:

```txt
Netflix
Prime Video
SonyLIV
YouTube Premium
Crunchyroll
Zee5
Spotify Premium
Free Fire Topup
Instagram Growth
Facebook Growth
TikTok Growth
```

For social services, use safe wording:

```txt
Organic profile growth support
Content promotion assistance
Audience reach package
Profile improvement support
```

Do not use:

```txt
Fake followers
Bot followers
Fake likes
Guaranteed fake engagement
```

---

## Data Source Rule

Products must come from Supabase.

Do not make demo data the final source.

Supabase must store:

```txt
Products
Plans
Prices
Offer prices
Images
Stock status
Reviews
Orders
Feedback
Settings
```

Demo data can exist only as a fallback when Supabase env is missing.

---

## Product Card

Each product card must show:

```txt
Product logo/image from Supabase Storage
Product name
Category
Short description
Starting offer price
Real price crossed out if offer exists
Save amount if offer exists
Rating
Review count
Stock status
Best Seller badge
View Plans button
Add to Cart button
```

Example:

```txt
Netflix
OTT & Streaming

From Rs. 299
Rs. 499 crossed out
Save Rs. 200

⭐ 4.8 (120 reviews)
In Stock

[View Plans] [Add to Cart]
```

Use:

```txt
shadcn Card
shadcn Badge
shadcn Button
Lucide icons
```

---

## Price Logic

Each plan must have:

```txt
real_price
offer_price
```

If `offer_price` exists and is lower than `real_price`, show:

```txt
Offer price as main price
Real price crossed out
Save amount
```

Frontend logic:

```ts
const displayPrice = plan.offer_price ?? plan.real_price;

const hasOffer =
  plan.offer_price !== null &&
  plan.offer_price !== undefined &&
  Number(plan.offer_price) < Number(plan.real_price);

const saveAmount = hasOffer
  ? Number(plan.real_price) - Number(plan.offer_price)
  : 0;
```

Starting price:

```ts
const activePlans = product.plans.filter((plan) => plan.is_active);

const startingPlan = activePlans.sort(
  (a, b) =>
    Number(a.offer_price ?? a.real_price) -
    Number(b.offer_price ?? b.real_price),
)[0];
```

---

## Product Modal

`View Plans` opens shadcn Dialog.

Modal must show:

```txt
Product image
Product name
Description
Category
All active plans
Plan features
Real price
Offer price
Save amount
Plan stock status
Product reviews
Google review form
Add selected plan to cart
```

Plan selection:

```txt
Use cards or radio-group
```

Rules:

```txt
Only active plans visible publicly
Out-of-stock plans visible but disabled
Coming soon plans visible but disabled
```

---

## Stock Status

Stock exists on product and plan level.

Allowed values:

```txt
In Stock
Low Stock
Out of Stock
Coming Soon
```

Rules:

```txt
In Stock -> can add to cart
Low Stock -> can add to cart, show warning badge
Out of Stock -> disable add to cart
Coming Soon -> disable add to cart
```

---

## Product Images

Use Supabase Storage.

Bucket:

```txt
product-images
```

Store:

```txt
Product logo
Product thumbnail
Product banner image
```

Product table fields:

```txt
logo_url
image_url
```

Admin uploads image to Supabase Storage and saves public URL to database.

No S3 needed for MVP.

---

## Cart

Use Zustand with localStorage.

Cart must support:

```txt
Add item
Remove item
Increase quantity
Decrease quantity
Clear cart
Calculate total
Persist cart in localStorage
```

Cart item type:

```ts
type CartItem = {
  productId: string;
  productName: string;
  planId: string;
  planName: string;
  realPrice: number;
  offerPrice: number | null;
  finalPrice: number;
  quantity: number;
  imageUrl?: string | null;
};
```

Use shadcn Sheet for cart drawer.

Cart drawer must show:

```txt
Product image
Product name
Plan name
Real price crossed out if offer exists
Final price
Quantity controls
Remove button
Subtotal
Checkout form
```

---

## Checkout Form

Fields:

```txt
Customer name
Phone number
Payment method
Optional note
```

Payment methods:

```txt
eSewa
Khalti
Bank Transfer
Manual Confirmation
```

Use Zod validation.

---

## WhatsApp Checkout

On checkout:

```txt
1. Validate form
2. Save order to Supabase
3. Mark whatsapp_sent as true
4. Redirect to WhatsApp with full order message
```

WhatsApp number from env/settings:

```env
NEXT_PUBLIC_WHATSAPP_NUMBER=977XXXXXXXXXX
```

Message format:

```txt
Hello OTT Subscriptions Nepal,

I want to order:

1. Netflix
Plan: 1 Month
Real Price: Rs. 499
Offer Price: Rs. 299
Qty: 1

2. Spotify Premium
Plan: 1 Month
Real Price: Rs. 699
Offer Price: Rs. 499
Qty: 1

Total: Rs. 798

Customer Name: [name]
Phone: [phone]
Payment Method: [payment]
Note: [note]

Please confirm availability.
```

Code:

```ts
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
window.open(whatsappUrl, "_blank");
```

---

# Google Login Review System

Reviews must require Google login.

Users cannot submit reviews anonymously.

Use Supabase Auth with Google provider.

Review flow:

```txt
1. User opens product modal
2. User clicks Add Review
3. If not logged in, show "Continue with Google"
4. User logs in with Google through Supabase Auth
5. After login, show review form
6. Review uses Google name, email, and avatar automatically
7. User only enters rating and comment
8. Review is saved as pending
9. Admin approves/rejects review
10. Only approved reviews show publicly
```

---

## Google Review UI

If user is not logged in:

```txt
Sign in with Google to write a review.
[Continue with Google]
```

If user is logged in:

Show avatar and name:

```txt
Avatar
Google Name
Google Email

Rating
Comment
[Submit Review]
```

Use:

```txt
shadcn Avatar
shadcn Button
shadcn Form
shadcn Textarea
```

Do not allow user to manually edit name/email/avatar.

Take these from Supabase Auth user metadata:

```ts
const name =
  user.user_metadata?.full_name || user.user_metadata?.name || "Google User";

const avatarUrl =
  user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

const email = user.email;
```

Review insert payload:

```ts
{
  product_id: productId,
  user_id: user.id,
  customer_name: name,
  customer_email: email,
  customer_avatar_url: avatarUrl,
  rating,
  comment,
  status: "pending"
}
```

After submit:

```txt
Review submitted. It will appear after approval.
```

---

## Google Auth Setup

Use Supabase Auth Google Provider.

Required env:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Supabase Auth redirect URL:

```txt
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

Create route:

```txt
/auth/callback
```

Create auth helpers:

```txt
lib/auth/get-user.ts
lib/auth/sign-in-google.ts
lib/auth/sign-out.ts
```

Google login button behavior:

```ts
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
});
```

Logout button:

```ts
await supabase.auth.signOut();
```

---

## Reviews Display

Public reviews should show:

```txt
Google avatar
Google name
Rating
Comment
Product name
Date
```

Do not show full email publicly.

Admin can see email.

Public review card:

```txt
[Avatar] Dhanush K.
★★★★★
Fast activation and good support.
Netflix • 2 days ago
```

If no avatar:

```txt
Use initials avatar
```

---

## Review Rules

```txt
Only logged-in Google users can submit reviews
One user can submit multiple reviews, but avoid spam with rate limit
All reviews default to pending
Only approved reviews show publicly
Admin can approve/reject/delete
Review email is stored but not publicly displayed
Avatar is public if review is approved
```

---

## Reviews Page

`/reviews` should show:

```txt
Approved reviews
Filter by service
Average rating
Total reviews
Google login CTA
```

---

## Feedback Footer

Feedback does not require login.

Fields:

```txt
Name
Phone or email
Message
```

On submit:

```txt
Save to Supabase feedback table
Show success toast
```

Footer content:

```txt
OTT Subscriptions Nepal
Premium digital subscription support in Nepal.

Quick Links:
Home
Services
Reviews
FAQ
Contact

Support:
WhatsApp
Email
Payment Help

Legal:
Terms
Privacy
Refund Policy
```

Disclaimer:

```txt
All trademarks belong to their respective owners. We provide subscription activation and digital service support.
```

---

## Admin Panel

Admin protected with Supabase Auth.

Admin routes:

```txt
/admin
/admin/login
/admin/products
/admin/orders
/admin/reviews
/admin/feedback
/admin/settings
```

Admin role check:

```txt
Use admin_users table
Only users in admin_users can access admin pages
```

Admin dashboard cards:

```txt
Total products
Active products
Total plans
Orders count
Pending reviews
Feedback count
Best sellers
Out of stock plans
```

Admin product management:

```txt
Add product
Edit product
Disable product
Upload image to Supabase Storage
Set category
Set description
Set stock status
Set best seller
Set active/inactive
Add nested plans
Edit nested plans
Delete/disable plans
Preview product card
```

Admin plan fields:

```txt
Plan name
Duration
Real price
Offer price
Features
Stock status
Active status
Sort order
```

Admin review management:

```txt
See user name
See user email
See user avatar
See product
See rating
See comment
Approve
Reject
Delete
```

Admin feedback:

```txt
View feedback
Delete feedback
Mark as resolved
```

Admin settings:

```txt
WhatsApp number
Site title
Support email
Payment instructions
Homepage announcement
Maintenance mode
```

---

## Rate Limiting

Implement rate limit:

```txt
30 requests per minute per IP
```

Apply to:

```txt
Checkout order API
Review submit API
Feedback submit API
Admin login attempt API if custom route is used
```

Use Upstash Redis in production.

Fallback to in-memory limiter for local development only.

Env:

```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RATE_LIMIT_REQUESTS_PER_MINUTE=30
```

If exceeded:

```txt
HTTP 429
Too many requests. Please try again after a minute.
```

Create:

```txt
lib/rate-limit.ts
```

Never expose Redis secrets to client.

Rate limit must run only on server/API routes.

---

## Security Headers

Add this in `next.config.ts`.

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.transparenttextures.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
```

If adding CSP, allow:

```txt
self
Supabase
Google avatar images
Transparent Textures
WhatsApp
```

Suggested CSP:

```txt
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.supabase.co https://www.transparenttextures.com https://lh3.googleusercontent.com;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co https://*.supabase.in;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

---

## Supabase Security Rules

Enable RLS on all tables.

Public users can:

```txt
Read active products
Read active plans
Read approved reviews
Insert feedback
Insert orders
```

Authenticated Google users can:

```txt
Insert own pending reviews
```

Public users cannot:

```txt
Insert reviews without login
Update products
Delete products
Approve reviews
Read all orders
Read private admin data
```

Admins can:

```txt
Create products
Update products
Manage plans
Manage reviews
Manage feedback
Manage settings
Read orders
```

Do not expose:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

to client.

---

## Database Schema

Use Supabase Postgres.

### admin_users

```sql
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text default 'admin',
  created_at timestamptz default now()
);
```

### products

```sql
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  category text not null,
  description text,
  logo_url text,
  image_url text,
  stock_status text default 'In Stock',
  is_best_seller boolean default false,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### plans

```sql
create table plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  name text not null,
  duration text,
  real_price numeric not null,
  offer_price numeric,
  features jsonb default '[]'::jsonb,
  stock_status text default 'In Stock',
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### orders

```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  payment_method text,
  note text,
  cart_items jsonb not null,
  total_amount numeric default 0,
  whatsapp_sent boolean default false,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### reviews

```sql
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_avatar_url text,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text default 'pending',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### feedback

```sql
create table feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  contact text,
  message text not null,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### settings

```sql
create table settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## RLS Policies

Enable RLS:

```sql
alter table admin_users enable row level security;
alter table products enable row level security;
alter table plans enable row level security;
alter table orders enable row level security;
alter table reviews enable row level security;
alter table feedback enable row level security;
alter table settings enable row level security;
```

Public read active products:

```sql
create policy "Public can read active products"
on products for select
using (is_active = true);
```

Public read active plans:

```sql
create policy "Public can read active plans"
on plans for select
using (is_active = true);
```

Public read approved reviews:

```sql
create policy "Public can read approved reviews"
on reviews for select
using (status = 'approved');
```

Authenticated users insert own pending reviews:

```sql
create policy "Authenticated users can insert own pending reviews"
on reviews for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'pending'
);
```

Authenticated users can read their own reviews:

```sql
create policy "Users can read own reviews"
on reviews for select
to authenticated
using (auth.uid() = user_id);
```

Public insert feedback:

```sql
create policy "Public can insert feedback"
on feedback for insert
with check (true);
```

Public insert orders:

```sql
create policy "Public can insert orders"
on orders for insert
with check (true);
```

Admin check rule:

```sql
exists (
  select 1 from admin_users
  where admin_users.id = auth.uid()
)
```

Admin full access for products:

```sql
create policy "Admins can manage products"
on products for all
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
);
```

Admin full access for plans:

```sql
create policy "Admins can manage plans"
on plans for all
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
);
```

Admin full access for orders:

```sql
create policy "Admins can manage orders"
on orders for all
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
);
```

Admin full access for reviews:

```sql
create policy "Admins can manage reviews"
on reviews for all
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
);
```

Admin full access for feedback:

```sql
create policy "Admins can manage feedback"
on feedback for all
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
);
```

Admin full access for settings:

```sql
create policy "Admins can manage settings"
on settings for all
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.id = auth.uid()
  )
);
```

Admin users can read own admin row:

```sql
create policy "Admins can read own admin user"
on admin_users for select
to authenticated
using (id = auth.uid());
```

---

## Supabase Storage

Create bucket:

```txt
product-images
```

Use public bucket for product images.

Folder pattern:

```txt
products/[product-slug]/logo.png
products/[product-slug]/banner.png
```

Only admin can upload/update/delete.

Public can read images.

---

## API Routes

Create:

```txt
/api/orders
/api/reviews
/api/feedback
/api/admin/products
/api/admin/plans
/api/admin/reviews
/api/admin/feedback
/api/admin/settings
```

Public write routes must use rate limit.

Review API must require authenticated user.

API rules:

```txt
Use Zod validation
Never trust client data
Use server-side Supabase user check
Use rate limiting
Return clear error messages
```

---

## Supabase Auth Routes

Create:

```txt
/auth/callback
```

Create auth helpers:

```txt
lib/auth/get-user.ts
lib/auth/sign-in-google.ts
lib/auth/sign-out.ts
```

---

## Environment Variables

Create `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=977XXXXXXXXXX

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
RATE_LIMIT_REQUESTS_PER_MINUTE=30
```

Never expose:

```txt
SUPABASE_SERVICE_ROLE_KEY
UPSTASH_REDIS_REST_TOKEN
```

to client components.

---

## Folder Structure

Use this structure:

```txt
app/
  layout.tsx
  page.tsx
  services/page.tsx
  cart/page.tsx
  reviews/page.tsx
  contact/page.tsx
  auth/callback/route.ts
  admin/page.tsx
  admin/login/page.tsx
  admin/products/page.tsx
  admin/orders/page.tsx
  admin/reviews/page.tsx
  admin/feedback/page.tsx
  admin/settings/page.tsx
  api/orders/route.ts
  api/reviews/route.ts
  api/feedback/route.ts
  api/admin/products/route.ts
  api/admin/plans/route.ts
  api/admin/reviews/route.ts
  api/admin/feedback/route.ts
  api/admin/settings/route.ts

components/
  site/header.tsx
  site/footer.tsx
  site/hero.tsx
  site/service-card.tsx
  site/service-grid.tsx
  site/product-modal.tsx
  site/cart-sheet.tsx
  site/review-card.tsx
  site/google-review-form.tsx
  site/how-it-works.tsx
  site/faq-section.tsx
  site/feedback-form.tsx
  site/trust-section.tsx
  auth/google-login-button.tsx
  auth/user-avatar-menu.tsx
  admin/admin-layout.tsx
  admin/product-form.tsx
  admin/product-table.tsx
  admin/plan-editor.tsx
  admin/review-table.tsx
  admin/feedback-table.tsx
  admin/settings-form.tsx

lib/
  supabase/client.ts
  supabase/server.ts
  supabase/admin.ts
  auth/get-user.ts
  auth/sign-in-google.ts
  auth/sign-out.ts
  store/cart-store.ts
  utils/whatsapp.ts
  utils/pricing.ts
  utils/format.ts
  rate-limit.ts
  validators/product.ts
  validators/plan.ts
  validators/review.ts
  validators/order.ts
  validators/feedback.ts

public/
  logo.png
```

---

## Supabase Clients

Create:

```txt
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/admin.ts
```

Rules:

```txt
client.ts -> browser safe anon client
server.ts -> server anon client with cookies
admin.ts -> service role only on server
```

Never import `admin.ts` into client components.

---

## Zod Validation

Order:

```txt
customer_name required
phone required
cart_items required and non-empty
total_amount required
payment_method optional
note optional
```

Review:

```txt
product_id required
rating 1 to 5
comment required
status forced to pending server-side
user_id from authenticated user only
customer_name from Google metadata only
customer_email from Google email only
customer_avatar_url from Google metadata only
```

Feedback:

```txt
message required
name optional
contact optional
```

Product:

```txt
name required
slug required
category required
description optional
logo_url optional
image_url optional
stock_status required
is_best_seller boolean
is_active boolean
```

Plan:

```txt
product_id required
name required
real_price required
offer_price optional
stock_status required
features array
is_active boolean
```

---

## Animation

Use Framer Motion for:

```txt
Hero fade up
Cards stagger
Section reveal
Review cards
Product modal
Cart drawer
```

Use GSAP for:

```txt
Hero rotating text
Subtle blue wave movement
Premium text reveal
```

Rules:

```txt
Keep animation smooth
No heavy bouncing
No distracting effects
Duration 0.4s to 0.8s
Stagger 0.08s
Respect prefers-reduced-motion
```

---

## Performance

Use:

```txt
Next/Image for product images
Server-side fetching where possible
Skeleton loading states
Lazy load admin-heavy components
Lazy load product modal
Compress images before upload if possible
Use pagination in admin tables
```

Avoid:

```txt
Large client bundles
Unnecessary client components
Fetching all orders on public pages
```

---

## SEO

Metadata:

```txt
Title: OTT Subscriptions Nepal | Premium OTT Plans & Digital Services
Description: Buy Netflix, Spotify, Prime Video, YouTube Premium, Crunchyroll, Zee5, Free Fire topup and digital services in Nepal with easy WhatsApp checkout.
```

Open Graph:

```txt
Use logo.png
Use site title
Use site description
```

Heading rules:

```txt
One h1 only
Use h2 for sections
Use h3 for cards
```

---

## Legal / Trust Wording

Footer disclaimer:

```txt
All trademarks belong to their respective owners. We provide subscription activation and digital service support.
```

Avoid claiming official partnership unless verified.

Do not use:

```txt
Official Netflix seller
Official Spotify seller
Guaranteed fake followers
Fake engagement
```

Use:

```txt
Subscription activation support
Digital service support
Renewal assistance
Organic growth support
```

---

## MVP Build Priority

Build in this order:

```txt
1. Project setup with Next.js, Tailwind, shadcn/ui
2. Global texture background and logo header
3. Supabase setup
4. Database schema and RLS
5. Product listing from Supabase
6. Product card with real price + offer price
7. Product modal with nested plans
8. Zustand cart
9. WhatsApp checkout
10. Google login
11. Google-authenticated review form
12. Admin login
13. Admin product/plan CRUD
14. Admin review approval
15. Feedback footer
16. Rate limit
17. Security headers
18. Vercel deployment
```

---

## Final Expected Output

The final app must include:

```txt
Professional landing page
Logo from /public/logo.png
Transparent Textures arches background
Supabase product listing
Supabase Storage product images
Nested plans
Real price + offer price display
Stock status
Add to cart
Cart drawer
WhatsApp checkout
Google login for reviews
Review avatar/name/email from Google
Pending review approval
Admin product management
Admin plan management
Admin review management
Admin feedback management
30 requests/minute rate limiting
Strong security headers
Mobile responsive UI
Framer Motion + GSAP animations
shadcn/ui components
Vercel-ready config
```
