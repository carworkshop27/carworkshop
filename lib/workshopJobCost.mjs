export const DAMAGE_COSTS = Object.freeze({
  ok: 0,
  scratch: 150,
  dent: 300,
  replace: 600,
  light_damage: 100,
  medium_damage: 250,
  large_damage: 400,
  polish: 75
});

const MAX_CENTS = 99999999999999;

function toCents(value, label) {
  if (
    typeof value !== "number" &&
    typeof value !== "string"
  ) {
    throw new Error(`Invalid amount: ${label}`);
  }

  const text = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    throw new Error(`Invalid amount: ${label}`);
  }

  const amount = Number(text);
  const cents = Math.round(amount * 100);

  if (
    !Number.isFinite(amount) ||
    !Number.isSafeInteger(cents) ||
    cents < 0 ||
    cents > MAX_CENTS
  ) {
    throw new Error(`Amount out of range: ${label}`);
  }

  return cents;
}

function validateArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${label} collection`);
  }

  if (value.length > 1000) {
    throw new Error(`Too many ${label} entries`);
  }

  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      throw new Error(`Invalid ${label} entry`);
    }
  }

  return value;
}

function addCents(current, amount) {
  const total = current + amount;

  if (
    !Number.isSafeInteger(total) ||
    total > MAX_CENTS
  ) {
    throw new Error("Total cost exceeds permitted limit");
  }

  return total;
}

function calculateItems(items, field, label) {
  return validateArray(items, label).reduce(
    (sum, item, index) => {
      const value = item[field];

      return addCents(
        sum,
        toCents(value, `${label} ${index + 1}`)
      );
    },
    0
  );
}

export function calculateWorkshopJobCost({
  panels,
  parts,
  electricalItems,
  mechanicalItems
}) {
  const seenPanels = new Set();

  const repairCents = validateArray(
    panels,
    "panel"
  ).reduce((sum, panel, index) => {
    const status = panel.status;

    if (
      typeof panel.id !== "string" ||
      !panel.id.trim() ||
      seenPanels.has(panel.id)
    ) {
      throw new Error(`Invalid or duplicate panel ${index + 1}`);
    }

    seenPanels.add(panel.id);

    if (
      typeof status !== "string" ||
      !Object.hasOwn(DAMAGE_COSTS, status)
    ) {
      throw new Error(`Invalid panel status: ${index + 1}`);
    }

    if (status === "ok") {
      return sum;
    }

    const customCost = panel.customRepairCost;

    const cost =
      customCost !== undefined &&
      customCost !== ""
        ? customCost
        : DAMAGE_COSTS[status];

    return addCents(
      sum,
      toCents(cost, `Panel ${index + 1}`)
    );
  }, 0);

  const partsCents = calculateItems(
    parts,
    "price",
    "part"
  );

  const electricalCents = calculateItems(
    electricalItems,
    "cost",
    "electrical item"
  );

  const mechanicalCents = calculateItems(
    mechanicalItems,
    "cost",
    "mechanical item"
  );

  const totalCents = [
    repairCents,
    partsCents,
    electricalCents,
    mechanicalCents
  ].reduce(addCents, 0);

  return {
    repairCost: repairCents / 100,
    partsCost: partsCents / 100,
    electricalCost: electricalCents / 100,
    mechanicalCost: mechanicalCents / 100,
    finalCost: totalCents / 100,
    currency: "SAR",
    vatIncluded: false
  };
}
