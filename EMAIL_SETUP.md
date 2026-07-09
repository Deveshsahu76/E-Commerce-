# ShopSphere Email Setup

## Features Enabled

- Forgot password OTP email
- Order confirmation email to customer
- New order alert email to admin

## Render Backend Environment Variables

Required:

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=ShopSphere <your-email@gmail.com>
ADMIN_NOTIFY_EMAIL=admin-email@example.com

Recommended also keep:

ADMIN_EMAIL=admin-email@example.com
CLIENT_URL=https://e-commerce-nu-bay.vercel.app

## Gmail Notes

Use Gmail App Password, not normal Gmail password.

If a Gmail app password was shared in screenshots or messages, rotate it before client handover.

## Testing

1. Open frontend login page.
2. Click Forgot password.
3. Enter registered email.
4. Check inbox/spam for OTP.
5. Reset password.
6. Login with new password.
7. Place an order.
8. Customer should receive order confirmation email.
9. Admin should receive new order alert email.

## Troubleshooting

If OTP is not sending:

- Check SMTP_USER
- Check SMTP_PASS
- Check SMTP_HOST
- Check SMTP_PORT
- Check Render logs
- Check Gmail App Password validity
- Check spam folder

If order is placed but email not received:

- Order creation should still work.
- Check Render logs for ORDER EMAIL ERROR.
- Check ADMIN_NOTIFY_EMAIL.