import nodemailer from "nodemailer";
import { generateReceiptPDF } from "./pdf";

// ─── Transporter ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"AgriConnect" <${process.env.SMTP_USER}>`;

// ─── Shared HTML layout ───────────────────────────────────────────────────────
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f4; font-family:'Segoe UI',Arial,sans-serif; }
    .wrap { max-width:600px; margin:32px auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
    .header { background:linear-gradient(135deg,#16a34a,#15803d); padding:32px 40px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:28px; font-weight:800; letter-spacing:-0.5px; }
    .header p  { margin:6px 0 0; color:#bbf7d0; font-size:14px; }
    .body { padding:36px 40px; }
    .greeting { font-size:20px; font-weight:700; color:#111827; margin-bottom:8px; }
    .subtitle  { color:#6b7280; font-size:15px; margin-bottom:28px; }
    .info-card { background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:20px 24px; margin-bottom:20px; }
    .info-card h3 { margin:0 0 14px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.8px; color:#6b7280; }
    table.items { width:100%; border-collapse:collapse; font-size:14px; }
    table.items th { text-align:left; padding:8px 6px; color:#9ca3af; font-size:12px; font-weight:600; border-bottom:1px solid #e5e7eb; }
    table.items td { padding:10px 6px; color:#374151; border-bottom:1px solid #f3f4f6; }
    table.items tr:last-child td { border-bottom:none; }
    .total-row td { font-weight:700; font-size:15px; color:#111827; padding-top:14px; }
    .badge { display:inline-block; padding:5px 14px; border-radius:999px; font-size:13px; font-weight:700; }
    .badge-pending    { background:#fef3c7; color:#92400e; }
    .badge-confirmed  { background:#dbeafe; color:#1e40af; }
    .badge-processing { background:#ede9fe; color:#5b21b6; }
    .badge-shipped    { background:#e0f2fe; color:#0369a1; }
    .badge-delivered  { background:#dcfce7; color:#166534; }
    .badge-cancelled  { background:#fee2e2; color:#991b1b; }
    .cta { display:block; width:fit-content; margin:24px auto 0; background:#16a34a; color:#fff!important; text-decoration:none; padding:14px 36px; border-radius:12px; font-weight:700; font-size:15px; }
    .receipt-box { border:2px dashed #e5e7eb; border-radius:12px; padding:20px 24px; text-align:center; margin:20px 0; }
    .receipt-box .amount { font-size:36px; font-weight:900; color:#16a34a; }
    .footer { background:#f9fafb; border-top:1px solid #f3f4f6; padding:20px 40px; text-align:center; color:#9ca3af; font-size:12px; }
    .footer a { color:#16a34a; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:4px;">
        <img src="https://agri-connect-bay.vercel.app/logo.png" alt="AgriConnect" style="width:48px;height:48px;border-radius:10px;object-fit:contain;" />
        <h1 style="margin:0;">AgriConnect</h1>
      </div>
      <p>Connecting Farmers & Buyers Directly</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      <p>Questions? <a href="mailto:${process.env.SMTP_USER}">${process.env.SMTP_USER}</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Status badge helper ───────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderItem {
  productName: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
  subtotal: number;
}

interface OrderEmailData {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  status: string;
  createdAt?: Date | string;
}

interface UserEmailData {
  name: string;
  email: string;
  role: string;
}

// ─── 1. Welcome email ─────────────────────────────────────────────────────────
export async function sendWelcomeEmail(user: UserEmailData): Promise<void> {
  const roleLabel =
    user.role === "farmer"
      ? "Farmer"
      : user.role === "industrial"
      ? "Industrial Buyer"
      : "Individual Buyer";

  const html = layout(`
    <p class="greeting">Welcome, ${user.name}! 👋</p>
    <p class="subtitle">Your AgriConnect account has been created successfully.</p>
    <div class="info-card">
      <h3>Account Details</h3>
      <table style="width:100%;font-size:14px;">
        <tr><td style="color:#6b7280;padding:4px 0;">Name</td><td style="font-weight:600;color:#111827;">${user.name}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0;">Email</td><td style="font-weight:600;color:#111827;">${user.email}</td></tr>
        <tr><td style="color:#6b7280;padding:4px 0;">Account Type</td><td style="font-weight:600;color:#16a34a;">${roleLabel}</td></tr>
      </table>
    </div>
    <p style="color:#6b7280;font-size:14px;line-height:1.7;">
      ${
        user.role === "farmer"
          ? "You can now list your farm products and start selling directly to buyers — no middlemen involved."
          : "Browse hundreds of farm-fresh products and order directly from verified farmers at fair prices."
      }
    </p>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/marketplace" class="cta">
      Explore Marketplace →
    </a>
  `);

  await transporter.sendMail({
    from: FROM,
    to: user.email,
    subject: `Welcome to AgriConnect, ${user.name}! 🌾`,
    html,
  });
}

// ─── 2. Order confirmation email ──────────────────────────────────────────────
export async function sendOrderConfirmationEmail(
  order: OrderEmailData,
  buyer: UserEmailData
): Promise<void> {
  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td>${item.productName}</td>
          <td style="text-align:center;">${item.quantity} ${item.unit}</td>
          <td style="text-align:right;">Rs.${item.pricePerUnit}</td>
          <td style="text-align:right;font-weight:600;">Rs.${item.subtotal}</td>
        </tr>`
    )
    .join("");

  const addr = order.shippingAddress;

  const html = layout(`
    <p class="greeting">Order Confirmed! 🎉</p>
    <p class="subtitle">Thank you, ${buyer.name}. Your order has been placed successfully.</p>

    <div class="info-card">
      <h3>Order Summary</h3>
      <table class="items">
        <thead><tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Subtotal</th></tr></thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td colspan="3">Total Amount</td>
            <td style="text-align:right;color:#16a34a;">Rs.${order.totalAmount}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="info-card">
      <h3>Delivery Address</h3>
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.8;">
        ${addr.street},<br/>${addr.city}, ${addr.state} - ${addr.pincode}<br/>
        📞 ${addr.phone}
      </p>
    </div>

    <div class="info-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
      <div>
        <div style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.6px;">Order ID</div>
        <div style="font-size:14px;font-weight:700;color:#111827;margin-top:4px;">#${String(order._id).slice(-8).toUpperCase()}</div>
      </div>
      <div>
        <div style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.6px;">Status</div>
        <div style="margin-top:4px;"><span class="badge badge-pending">Pending</span></div>
      </div>
    </div>

    <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/buyer" class="cta">
      Track Your Order →
    </a>
  `);

  await transporter.sendMail({
    from: FROM,
    to: buyer.email,
    subject: `Order Confirmed #${String(order._id).slice(-8).toUpperCase()} — AgriConnect`,
    html,
  });
}

// ─── 3. Order status update email (+ receipt on delivery) ─────────────────────
export async function sendOrderStatusEmail(
  order: OrderEmailData,
  buyer: UserEmailData,
  newStatus: string
): Promise<void> {
  const statusLabel = STATUS_LABEL[newStatus] ?? newStatus;
  const isDelivered = newStatus === "delivered";
  const isCancelled = newStatus === "cancelled";

  const statusMessages: Record<string, string> = {
    confirmed: "Great news! Your order has been confirmed by the farmer and is being prepared.",
    processing: "Your order is currently being processed and packed at the farm.",
    shipped: "Your order is on its way! Expect delivery within the next few days.",
    delivered: "Your order has been delivered. We hope you enjoy the fresh produce!",
    cancelled: "Unfortunately, your order has been cancelled.",
  };

  const rows = order.items
    .map(
      (item) =>
        `<tr>
          <td>${item.productName}</td>
          <td style="text-align:center;">${item.quantity} ${item.unit}</td>
          <td style="text-align:right;">Rs.${item.pricePerUnit}</td>
          <td style="text-align:right;font-weight:600;">Rs.${item.subtotal}</td>
        </tr>`
    )
    .join("");

  const receiptSection = isDelivered
    ? `<div class="receipt-box">
        <div style="color:#6b7280;font-size:13px;margin-bottom:8px;">PAYMENT RECEIPT</div>
        <div class="amount">Rs.${order.totalAmount}</div>
        <div style="color:#6b7280;font-size:13px;margin-top:8px;">Order #${String(order._id).slice(-8).toUpperCase()} · ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
        <div style="margin-top:12px;"><span class="badge badge-delivered">✓ Delivered</span></div>
      </div>

      <div class="info-card">
        <h3>Itemised Receipt</h3>
        <table class="items">
          <thead><tr><th>Product</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Rate</th><th style="text-align:right;">Subtotal</th></tr></thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td colspan="3">Total Paid</td>
              <td style="text-align:right;color:#16a34a;">Rs.${order.totalAmount}</td>
            </tr>
          </tbody>
        </table>
      </div>`
    : `<div class="info-card" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.6px;">Order ID</div>
          <div style="font-size:14px;font-weight:700;color:#111827;margin-top:4px;">#${String(order._id).slice(-8).toUpperCase()}</div>
        </div>
        <div>
          <div style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.6px;">New Status</div>
          <div style="margin-top:4px;"><span class="badge badge-${newStatus}">${statusLabel}</span></div>
        </div>
      </div>`;

  const subjectEmoji = isDelivered ? "📦" : isCancelled ? "❌" : "🔔";

  const html = layout(`
    <p class="greeting">${isDelivered ? "Order Delivered!" : isCancelled ? "Order Cancelled" : `Order Update: ${statusLabel}`} ${subjectEmoji}</p>
    <p class="subtitle">${statusMessages[newStatus] ?? `Your order status has been updated to ${statusLabel}.`}</p>
    ${receiptSection}
    ${
      !isCancelled
        ? `<a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/buyer" class="cta">
            ${isDelivered ? "View Order History →" : "Track Your Order →"}
          </a>`
        : ""
    }
  `);

  const subject = isDelivered
    ? `Receipt & Delivery Confirmation #${String(order._id).slice(-8).toUpperCase()} — AgriConnect`
    : `Order ${statusLabel}: #${String(order._id).slice(-8).toUpperCase()} — AgriConnect`;

  // Generate and attach PDF receipt on delivery
  const attachments: { filename: string; content: Buffer; contentType: string }[] = [];
  if (isDelivered) {
    try {
      const pdfBuffer = await generateReceiptPDF({
        orderId: String(order._id),
        buyerName: buyer.name,
        buyerEmail: buyer.email,
        items: order.items,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        deliveredAt: new Date(),
      });
      attachments.push({
        filename: `AgriConnect_Receipt_${String(order._id).slice(-8).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
    }
  }

  await transporter.sendMail({ from: FROM, to: buyer.email, subject, html, attachments });
}
