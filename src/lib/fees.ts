const EARLY_LAUNCH_PROMO_END_DATE = "2026-08-01";
const STRIPE_PROCESSING_PERCENT = 0.029;
const STRIPE_PROCESSING_FIXED_FEE_CENTS = 30;

export function isEarlyLaunchPromoListing(listingCreatedAt?: string | null) {
  if (!listingCreatedAt) {
    return false;
  }

  return listingCreatedAt.slice(0, 10) < EARLY_LAUNCH_PROMO_END_DATE;
}

export function calculateStripeProcessingFeeCents(totalAmountCents: number) {
  if (!Number.isInteger(totalAmountCents) || totalAmountCents < 0) {
    throw new Error("Total amount must be a positive number of cents.");
  }

  if (totalAmountCents === 0) {
    return 0;
  }

  return Math.round(totalAmountCents * STRIPE_PROCESSING_PERCENT) + STRIPE_PROCESSING_FIXED_FEE_CENTS;
}

export function calculatePlatformFeeCents(
  itemAmountCents: number,
  listingCreatedAt?: string | null,
  totalAmountCents = itemAmountCents
) {
  if (!Number.isInteger(itemAmountCents) || itemAmountCents < 0) {
    throw new Error("Item amount must be a positive number of cents.");
  }

  if (isEarlyLaunchPromoListing(listingCreatedAt)) {
    return calculateStripeProcessingFeeCents(totalAmountCents);
  }

  const eightPercentFeeCents = Math.round(itemAmountCents * 0.08);
  const minimumFeeCents = 100;

  return Math.max(eightPercentFeeCents, minimumFeeCents);
}

export function centsToDollars(cents: number) {
  return Number((cents / 100).toFixed(2));
}

export function dollarsToCents(dollars: number) {
  return Math.round(dollars * 100);
}