export function calculatePlatformFeeCents(itemAmountCents: number) {
  if (!Number.isInteger(itemAmountCents) || itemAmountCents < 0) {
    throw new Error("Item amount must be a positive number of cents.");
  }

  if (itemAmountCents <= 30000) {
    return Math.round(itemAmountCents * 0.06);
  }

  if (itemAmountCents <= 50000) {
    return 2500;
  }

  if (itemAmountCents <= 100000) {
    return 3500;
  }

  return 5000;
}

export function centsToDollars(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function dollarsToCents(dollars: number) {
  return Math.round(dollars * 100);
}
