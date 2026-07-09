# SonicRaksha Client Demo Guide

## Demo URLs

Frontend:
https://e-commerce-nu-bay.vercel.app

Backend:
https://e-commerce-backend-1i0x.onrender.com

Admin Panel:
https://e-commerce-nu-bay.vercel.app/admin

## Demo Flow

### 1. Admin Product Management

Open admin panel:

https://e-commerce-nu-bay.vercel.app/admin

Login using configured admin email.

Admin can:

- View dashboard
- Add product
- Edit product
- Delete product
- View orders
- Update order status
- Update payment status

### 2. Add Demo Product

Recommended demo product:

Product Name:
Solar Snake Repellent Device

Category:
Solar Repeller

Brand:
SonicRaksha

Price:
599

Original Price:
799

Stock:
20

Short Description:
Solar-powered outdoor snake repellent device for farms, gardens and home surroundings.

Description:
This device is designed for outdoor use and helps customers protect farms, gardens, lawns and home boundaries. Easy to install and suitable for rural and residential use.

### 3. Customer Shopping Flow

Customer steps:

1. Open Products page
2. View product details
3. Add product to cart
4. Open cart
5. Proceed to checkout
6. Fill shipping address
7. Select Cash on Delivery
8. Place order
9. Open Orders page

### 4. Admin Order Flow

Admin steps:

1. Open Admin Panel
2. Go to Orders
3. View new order
4. Update order status:
   - Pending
   - Confirmed
   - Packed
   - Shipped
   - Delivered
5. Update payment status:
   - Pending
   - Paid

## Current Production Notes

Working:

- Product management
- Customer product browsing
- Cart
- COD checkout
- Order creation
- Admin order management
- Track order page UI
- Support page UI
- SEO basics

Optional Later:

- Forgot password email OTP
- Order email notification
- Live Razorpay payment
- Custom domain
- Business email
- Google Search Console
- Analytics

## Security Before Final Client Handover

Rotate:

- MongoDB password
- JWT_SECRET
- Razorpay secret
- Gmail App Password
- Any exposed API key

Do not commit:

- .env files
- Secret keys
- Database credentials