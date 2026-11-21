const round = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateInvoiceTotals(
  items,
  additionalDiscount = 0,
  vatRate = 15
) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one invoice item is required.");
  }

  if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
    throw new Error("Invalid VAT rate.");
  }

  const subtotal = round(
    items.reduce((sum, item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const discount = Number(item.discount || 0);

      if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0 ||
        !Number.isFinite(discount) ||
        discount < 0 ||
        discount > quantity * unitPrice
      ) {
        throw new Error("Invalid invoice item amounts.");
      }

      return sum + round(quantity * unitPrice - discount);
    }, 0)
  );

  const MAX_INVOICE_AMOUNT = 1000000;

  if (
    !Number.isFinite(subtotal) ||
    subtotal > MAX_INVOICE_AMOUNT
  ) {
    throw new Error("Invoice subtotal exceeds the permitted limit.");
  }

  const discount = Number(additionalDiscount);

  if (
    !Number.isFinite(discount) ||
    discount < 0 ||
    discount > subtotal
  ) {
    throw new Error("Invalid additional discount.");
  }

  const taxableAmount = round(subtotal - discount);
  const vatAmount = round(taxableAmount * vatRate / 100);
  const totalAmount = round(taxableAmount + vatAmount);

  if (
    !Number.isFinite(totalAmount) ||
    totalAmount > MAX_INVOICE_AMOUNT
  ) {
    throw new Error("Invoice total exceeds the permitted limit.");
  }

  return {
    subtotal,
    discount: round(discount),
    taxableAmount,
    vatRate,
    vatAmount,
    totalAmount,
    currency: "SAR",
  };
}
