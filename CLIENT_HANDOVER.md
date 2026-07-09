# ShopSphere - Client Handover

## Project Type
Focused e-commerce store for Snake Repellent, Solar Pest Repellent, Ultrasonic Pest Repeller, Rodent Control and Outdoor Protection products.

## Live URLs
Frontend:
https://e-commerce-nu-bay.vercel.app

Backend:
https://e-commerce-backend-1i0x.onrender.com

Admin Panel:
https://e-commerce-nu-bay.vercel.app/admin

## Admin Usage

### Login
Only the configured admin email can access the admin panel.

Backend Render environment variable required:

ADMIN_EMAIL=admin-email@example.com

The same email should be registered on the website.

### Admin Can
- View dashboard
- Add products
- Edit products
- Delete products
- View orders
- Update order status
- Update payment status

## Product Fields
Admin can add:

- Product name
- Category
- Brand
- Price
- Original price
- Stock
- Short description
- Full description
- Product image URL
- Active status

Allowed categories:

- Snake Repeller
- Solar Repeller
- Ultrasonic Pest Repeller
- Rodent Control
- Outdoor Protection

## Order Status Flow

Recommended order statuses:

1. Pending
2. Confirmed
3. Packed
4. Shipped
5. Delivered
6. Cancelled

Payment statuses:

1. Pending
2. Paid
3. Failed
4. Refunded

## Important Pending Items

Email OTP / forgot password requires paid SMTP or Resend/Brevo setup.

Payment gateway live mode requires Razorpay production keys.

## Environment Variables

### Vercel Frontend

REACT_APP_API_URL=https://e-commerce-backend-1i0x.onrender.com/api
CI=false

### Render Backend

NODE_ENV=production
PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-secret
CLIENT_URL=https://e-commerce-nu-bay.vercel.app
ADMIN_EMAIL=admin-email@example.com

Optional:

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

## Final Testing Checklist

Customer side:

- Home page loads
- Products page loads
- Product details opens
- Add to cart works
- Cart quantity update works
- Checkout works
- Order creation works
- Orders page works
- Login/register works
- Mobile responsive

Admin side:

- Admin login works
- Dashboard loads
- Add product works
- Edit product works
- Delete product works
- Product appears on customer side
- Orders list loads
- Order status update works
- Payment status update works

Security before final handover:

- Rotate MongoDB password if shared in screenshot
- Rotate JWT_SECRET
- Rotate Razorpay secret
- Rotate Gmail App Password
- Do not commit .env files