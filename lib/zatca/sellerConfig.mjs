export const ZATCA_SELLER = Object.freeze({
  registeredName: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0637\u0644\u0627\u0621 \u0627\u0644\u0641\u0627\u062e\u0631",
  vatNumber: "300096253100003",
  vatEffectiveDate: "2026-10-01",
  vatRate: 15,
  currency: "SAR",
});

export function validateZatcaSeller() {
  if (!ZATCA_SELLER.registeredName.trim()) {
    throw new Error("Registered seller name is required.");
  }

  if (!/^\d{15}$/.test(ZATCA_SELLER.vatNumber)) {
    throw new Error("Invalid seller VAT registration number.");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(ZATCA_SELLER.vatEffectiveDate)) {
    throw new Error("Invalid VAT effective date.");
  }

  return ZATCA_SELLER;
}
