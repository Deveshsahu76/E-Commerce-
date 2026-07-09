const sendEmail = require("./sendEmail");

const formatPrice = (value = 0) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getOrderTotal = (order = {}) => {
  return order.totalPrice || order.totalAmount || order.total || 0;
};

const getOrderStatus = (order = {}) => {
  return order.orderStatus || order.status || "Pending";
};

const getCustomerEmail = (order = {}) => {
  return order.shippingAddress?.email || order.user?.email || "";
};

const getCustomerName = (order = {}) => {
  return order.shippingAddress?.fullName || order.user?.name || "Customer";
};

const getOrderItemsHtml = (order = {}) => {
  const items = order.orderItems || order.items || [];

  if (!items.length) return "<p>No items found.</p>";

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:16px">
      <thead>
        <tr>
          <th style="text-align:left;border-bottom:1px solid #e5eee2;padding:8px">Product</th>
          <th style="text-align:center;border-bottom:1px solid #e5eee2;padding:8px">Qty</th>
          <th style="text-align:right;border-bottom:1px solid #e5eee2;padding:8px">Price</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
              <tr>
                <td style="border-bottom:1px solid #f0f4ef;padding:8px">${item.name || "Product"}</td>
                <td style="text-align:center;border-bottom:1px solid #f0f4ef;padding:8px">${item.quantity || 1}</td>
                <td style="text-align:right;border-bottom:1px solid #f0f4ef;padding:8px">${formatPrice(item.price || 0)}</td>
              </tr>
            `
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const buildCustomerOrderEmail = (order = {}) => {
  const orderId = order._id || order.id || "";
  const total = getOrderTotal(order);
  const status = getOrderStatus(order);
  const customerName = getCustomerName(order);

  return {
    subject: `SonicRaksha Order Confirmed - ${String(orderId).slice(-8)}`,
    text: `Hello ${customerName},

Your SonicRaksha order has been placed successfully.

Order ID: ${orderId}
Status: ${status}
Total: ${formatPrice(total)}

Thank you for shopping with SonicRaksha.`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:24px;border:1px solid #e5eee2;border-radius:18px">
        <h2 style="margin:0 0 10px;color:#14213d">Order placed successfully</h2>
        <p>Hello ${customerName},</p>
        <p>Your SonicRaksha order has been placed successfully.</p>
        <div style="background:#f7faf5;border-radius:14px;padding:16px;margin:18px 0">
          <p style="margin:0 0 8px"><b>Order ID:</b> ${orderId}</p>
          <p style="margin:0 0 8px"><b>Status:</b> ${status}</p>
          <p style="margin:0"><b>Total:</b> ${formatPrice(total)}</p>
        </div>
        ${getOrderItemsHtml(order)}
        <p style="margin-top:18px;color:#5f6f63">Thank you for shopping with SonicRaksha.</p>
      </div>
    `,
  };
};

const buildAdminOrderEmail = (order = {}) => {
  const orderId = order._id || order.id || "";
  const customerName = getCustomerName(order);
  const customerEmail = getCustomerEmail(order);
  const total = getOrderTotal(order);

  return {
    subject: `New SonicRaksha Order - ${String(orderId).slice(-8)}`,
    text: `New order received.

Order ID: ${orderId}
Customer: ${customerName}
Email: ${customerEmail}
Total: ${formatPrice(total)}

Open admin panel to process this order.`,

    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:24px;border:1px solid #e5eee2;border-radius:18px">
        <h2 style="margin:0 0 10px;color:#14213d">New order received</h2>
        <div style="background:#f7faf5;border-radius:14px;padding:16px;margin:18px 0">
          <p style="margin:0 0 8px"><b>Order ID:</b> ${orderId}</p>
          <p style="margin:0 0 8px"><b>Customer:</b> ${customerName}</p>
          <p style="margin:0 0 8px"><b>Email:</b> ${customerEmail}</p>
          <p style="margin:0"><b>Total:</b> ${formatPrice(total)}</p>
        </div>
        ${getOrderItemsHtml(order)}
        <p style="margin-top:18px;color:#5f6f63">Open admin panel to process this order.</p>
      </div>
    `,
  };
};

const notifyOrderPlaced = async (order = {}) => {
  const tasks = [];

  const customerEmail = getCustomerEmail(order);
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;

  if (customerEmail) {
    const customerEmailContent = buildCustomerOrderEmail(order);

    tasks.push(
      sendEmail({
        to: customerEmail,
        subject: customerEmailContent.subject,
        text: customerEmailContent.text,
        html: customerEmailContent.html,
      })
    );
  }

  if (adminEmail) {
    const adminEmailContent = buildAdminOrderEmail(order);

    tasks.push(
      sendEmail({
        to: adminEmail,
        subject: adminEmailContent.subject,
        text: adminEmailContent.text,
        html: adminEmailContent.html,
      })
    );
  }

  const results = await Promise.allSettled(tasks);

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error("ORDER EMAIL ERROR:", result.reason?.message || result.reason);
    }
  });

  return results;
};

module.exports = {
  notifyOrderPlaced,
};