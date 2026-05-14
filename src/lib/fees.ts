export function calculatePlatformFeeCents(itemAmountCents: number) {
  if (!Number.isInteger(itemAmountCents) || itemAmountCents < 0) {
    throw new Error("Item amount must be a positive number of cents.");
  }

  return Math.round(itemAmountCents * 0.08);
}

export function centsToDollars(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function dollarsToCents(dollars: number) {
  return Math.round(dollars * 100);
}