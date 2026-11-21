const encoder = new TextEncoder();

function tlvField(tag, value) {
  const bytes = encoder.encode(String(value));
  if (bytes.length > 255) {
    throw new Error(`ZATCA field ${tag} exceeds 255 bytes`);
  }
  return [tag, bytes.length, ...bytes];
}

export function encodeZatcaPhase1({
  sellerName,
  vatNumber,
  issueDate,
  invoiceTotal,
  vatTotal,
}) {
  if (!sellerName?.trim()) {
    throw new Error("Seller name is required");
  }

  if (!/^\d{15}$/.test(String(vatNumber))) {
    throw new Error("Valid 15-digit VAT number is required");
  }

  const timestamp = new Date(issueDate);

  if (!issueDate || Number.isNaN(timestamp.getTime())) {
    throw new Error("Valid invoice issuance timestamp is required");
  }

  const total = Number(invoiceTotal);
  const vat = Number(vatTotal);

  if (
    !Number.isFinite(total) ||
    !Number.isFinite(vat) ||
    total < 0 ||
    vat < 0 ||
    vat > total
  ) {
    throw new Error("Invalid invoice totals");
  }

  const fields = [
    tlvField(1, sellerName),
    tlvField(2, vatNumber),
    tlvField(3, timestamp.toISOString()),
    tlvField(4, total.toFixed(2)),
    tlvField(5, vat.toFixed(2)),
  ];

  const bytes = Uint8Array.from(fields.flat());

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}
