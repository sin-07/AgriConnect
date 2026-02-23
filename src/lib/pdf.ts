import { PDFDocument, StandardFonts, rgb, PageSizes } from "pdf-lib";
import * as fs from "fs";
import * as path from "path";

interface ReceiptItem {
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  subtotal: number;
}

export interface ReceiptData {
  orderId: string;
  buyerName: string;
  buyerEmail: string;
  items: ReceiptItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  deliveredAt?: Date | string;
}

// Helpers
const GREEN  = rgb(0.086, 0.639, 0.290);
const DGREEN = rgb(0.055, 0.502, 0.200);
const LGREEN = rgb(0.940, 0.992, 0.952);
const DARK   = rgb(0.067, 0.094, 0.153);
const GRAY   = rgb(0.420, 0.447, 0.500);
const LGRAY  = rgb(0.953, 0.961, 0.969);
const WHITE  = rgb(1, 1, 1);
const LINE   = rgb(0.898, 0.914, 0.933);

function hex(r: number, g: number, b: number) { return rgb(r/255, g/255, b/255); }
void hex; // suppress unused warning

/** Returns a Buffer containing the PDF receipt */
export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page   = pdfDoc.addPage(PageSizes.A4);
  const { width, height } = page.getSize();

  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const shortId = data.orderId.slice(-8).toUpperCase();
  const deliveredDate = data.deliveredAt
    ? new Date(data.deliveredAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const margin = 50;
  const contentW = width - margin * 2;

  // ── Header band ───────────────────────────────────────────────────────
  const headerH = 80;
  page.drawRectangle({ x: 0, y: height - headerH, width, height: headerH, color: GREEN });

  // Embed logo on the left
  let textX = margin;
  const logoSize = 46;
  try {
    const logoBytes = fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
    const logoImg = await pdfDoc.embedPng(logoBytes);
    page.drawImage(logoImg, {
      x: margin,
      y: height - headerH + (headerH - logoSize) / 2,
      width: logoSize,
      height: logoSize,
    });
    textX = margin + logoSize + 12;
  } catch { /* logo not found, skip */ }

  page.drawText("AgriConnect", {
    x: textX, y: height - 38, font: bold, size: 22, color: WHITE,
  });
  page.drawText("Connecting Farmers & Buyers Directly", {
    x: textX, y: height - 58, font: regular, size: 10, color: rgb(0.733, 0.969, 0.816),
  });
  const receiptLabel = "DELIVERY RECEIPT";
  const receiptLabelW = bold.widthOfTextAtSize(receiptLabel, 11);
  page.drawText(receiptLabel, {
    x: width - margin - receiptLabelW, y: height - 45, font: bold, size: 11, color: WHITE,
  });

  // ── Section: Receipt + Buyer details ─────────────────────────────────
  let y = height - headerH - 30;

  // Left column — receipt details
  page.drawText("Receipt Details", { x: margin, y, font: bold, size: 12, color: DARK });
  y -= 20;
  const leftLabels = ["Order ID:", "Date:", "Status:"];
  const leftValues = [`#${shortId}`, deliveredDate, "DELIVERED"];
  leftLabels.forEach((lbl, i) => {
    page.drawText(lbl,         { x: margin,       y: y - i * 18, font: regular, size: 10, color: GRAY });
    page.drawText(leftValues[i], { x: margin + 90,  y: y - i * 18, font: bold,    size: 10, color: i === 2 ? GREEN : DARK });
  });

  // Right column — buyer details
  const col2 = margin + contentW / 2;
  y += 20; // reset to section start
  page.drawText("Buyer Details", { x: col2, y, font: bold, size: 12, color: DARK });
  y -= 20;
  const rightLabels = ["Name:", "Email:", "Phone:"];
  const rightValues = [data.buyerName, data.buyerEmail, data.shippingAddress.phone];
  rightLabels.forEach((lbl, i) => {
    page.drawText(lbl,            { x: col2,       y: y - i * 18, font: regular, size: 10, color: GRAY });
    page.drawText(rightValues[i], { x: col2 + 70,  y: y - i * 18, font: regular, size: 10, color: DARK });
  });

  y -= 60;

  // ── Divider ───────────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: LINE });
  y -= 20;

  // ── Delivery Address ──────────────────────────────────────────────────
  page.drawText("Delivery Address", { x: margin, y, font: bold, size: 12, color: DARK });
  y -= 18;
  const addr = data.shippingAddress;
  page.drawText(`${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`, {
    x: margin, y, font: regular, size: 10, color: GRAY, maxWidth: contentW,
  });
  y -= 30;

  // ── Divider ───────────────────────────────────────────────────────────
  page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: LINE });
  y -= 24;

  // ── Items Table ───────────────────────────────────────────────────────
  const colX = [margin, margin + 220, margin + 320, margin + 410];
  const rowH = 22;

  // Table header
  page.drawRectangle({ x: margin, y: y - 4, width: contentW, height: rowH, color: LGRAY });
  const headers = ["PRODUCT", "QTY", "RATE (Rs.)", "SUBTOTAL (Rs.)"];
  headers.forEach((h, i) => {
    page.drawText(h, { x: colX[i] + 6, y: y + 4, font: bold, size: 9, color: GRAY });
  });
  y -= rowH + 4;

  // Item rows
  data.items.forEach((item, idx) => {
    if (idx % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 4, width: contentW, height: rowH, color: rgb(0.980, 0.984, 0.988) });
    }
    const cells = [
      item.productName.slice(0, 30),
      `${item.quantity} ${item.unit}`,
      `${item.pricePerUnit.toFixed(2)}`,
      `${item.subtotal.toFixed(2)}`,
    ];
    cells.forEach((cell, i) => {
      page.drawText(cell, { x: colX[i] + 6, y: y + 4, font: regular, size: 9, color: DARK });
    });
    y -= rowH;
  });

  // Total row
  y -= 6;
  page.drawLine({ start: { x: margin, y: y + 14 }, end: { x: width - margin, y: y + 14 }, thickness: 0.5, color: LINE });
  y -= 4;
  page.drawRectangle({ x: margin, y: y - 4, width: contentW, height: 30, color: LGREEN });
  page.drawText("TOTAL AMOUNT", { x: colX[0] + 6, y: y + 8, font: bold, size: 11, color: DGREEN });
  const totalStr = `Rs. ${data.totalAmount.toFixed(2)}`;
  const totalW = bold.widthOfTextAtSize(totalStr, 11);
  page.drawText(totalStr, { x: width - margin - totalW - 6, y: y + 8, font: bold, size: 11, color: GREEN });

  // ── Footer ────────────────────────────────────────────────────────────
  const footerY = 36;
  page.drawLine({ start: { x: margin, y: footerY + 20 }, end: { x: width - margin, y: footerY + 20 }, thickness: 0.5, color: LINE });
  const footerText = "Thank you for shopping with AgriConnect. Fresh from the farm, straight to you.";
  const footerW = regular.widthOfTextAtSize(footerText, 9);
  page.drawText(footerText, { x: (width - footerW) / 2, y: footerY + 6, font: regular, size: 9, color: GRAY });
  const copy = `© ${new Date().getFullYear()} AgriConnect. All rights reserved.`;
  const copyW = regular.widthOfTextAtSize(copy, 8);
  page.drawText(copy, { x: (width - copyW) / 2, y: footerY - 8, font: regular, size: 8, color: GRAY });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
