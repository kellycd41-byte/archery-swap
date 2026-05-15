import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import {
  calculatePlatformFeeCents,
  centsToDollars,
  dollarsToCents,
} from "@/lib/fees";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Listing = {
  id: string;
  user_id: string | null;
  title: string;
  price: number;
  shipping_cost: number | null;
  status: string;
};

type SellerPayoutAccount = {
  stripe_account_id: string;
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "You must be signed in to buy this item." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    if (!siteUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SITE_URL environment variable." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      listingId?: string;
    };

    const listingId = body.listingId;

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing id." },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
      auth: {
        persistSession: false,
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Please sign in again before buying this item." },
        { status: 401 }
      );
    }

    const { data: listingData, error: listingError } = await supabase
      .from("listings")
      .select("id, user_id, title, price, shipping_cost, status")
      .eq("id", listingId)
      .single();

    if (listingError || !listingData) {
      return NextResponse.json(
        { error: "Listing not found." },
        { status: 404 }
      );
    }

    const listing = listingData as Listing;

    if (listing.status !== "active") {
      return NextResponse.json(
        { error: "This listing is not available for checkout." },
        { status: 400 }
      );
    }

    if (!listing.user_id) {
      return NextResponse.json(
        { error: "Checkout is not available for this older listing." },
        { status: 400 }
      );
    }

    if (listing.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot buy your own listing." },
        { status: 400 }
      );
    }

    const { data: payoutAccountData, error: payoutAccountError } =
      await supabaseAdmin
        .from("seller_payout_accounts")
        .select("stripe_account_id")
        .eq("user_id", listing.user_id)
        .maybeSingle();

    if (payoutAccountError) {
      return NextResponse.json(
        { error: payoutAccountError.message },
        { status: 500 }
      );
    }

    const payoutAccount = payoutAccountData as SellerPayoutAccount | null;

    if (!payoutAccount?.stripe_account_id) {
      return NextResponse.json(
        {
          error:
            "This seller has not finished payout setup yet. Please try again later.",
        },
        { status: 400 }
      );
    }

    const stripeAccount = await stripe.accounts.retrieve(
      payoutAccount.stripe_account_id
    );

    await supabaseAdmin
      .from("seller_payout_accounts")
      .update({
        charges_enabled: stripeAccount.charges_enabled,
        payouts_enabled: stripeAccount.payouts_enabled,
        details_submitted: stripeAccount.details_submitted,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", listing.user_id);

    if (
      !stripeAccount.charges_enabled ||
      !stripeAccount.payouts_enabled ||
      !stripeAccount.details_submitted
    ) {
      return NextResponse.json(
        {
          error:
            "This seller has not finished payout setup yet. Please try again later.",
        },
        { status: 400 }
      );
    }

    const itemAmountCents = dollarsToCents(Number(listing.price) || 0);
    const shippingAmountCents = dollarsToCents(
      Number(listing.shipping_cost) || 0
    );
    const totalAmountCents = itemAmountCents + shippingAmountCents;
    const platformFeeCents = calculatePlatformFeeCents(itemAmountCents);
    const sellerPayoutCents = totalAmountCents - platformFeeCents;
    const shipByDate = new Date();
    shipByDate.setDate(shipByDate.getDate() + 5);

    if (itemAmountCents <= 0 || totalAmountCents <= 0) {
      return NextResponse.json(
        { error: "This listing has an invalid price." },
        { status: 400 }
      );
    }

    const lineItems = [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: itemAmountCents,
          product_data: {
            name: listing.title,
          },
        },
      },
    ];

    if (shippingAmountCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: shippingAmountCents,
          product_data: {
            name: "Shipping",
          },
        },
      });
    }

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.user_id,
        stripe_connected_account_id: payoutAccount.stripe_account_id,
        item_amount: centsToDollars(itemAmountCents),
        shipping_amount: centsToDollars(shippingAmountCents),
        platform_fee_amount: centsToDollars(platformFeeCents),
        seller_payout_amount: centsToDollars(sellerPayoutCents),
        total_amount: centsToDollars(totalAmountCents),
        transfer_status: "not_released",
        ship_by_date: shipByDate.toISOString(),
        status: "pending",
      })
      .select("id")
      .single();

    if (orderError || !orderData) {
      return NextResponse.json(
        {
          error:
            orderError?.message ||
            "Something went wrong while creating the order.",
        },
        { status: 500 }
      );
    }

    const order = orderData as {
      id: string;
    };

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        listingId: listing.id,
        buyerId: user.id,
        sellerId: listing.user_id,
        checkoutType: "buy_now",
      },
      success_url: `${siteUrl}/account?checkout=success&order=${order.id}`,
      cancel_url: `${siteUrl}/listing/${listing.id}?checkout=cancelled`,
    });

    if (!checkoutSession.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    const { error: updateOrderError } = await supabaseAdmin
      .from("orders")
      .update({
        stripe_checkout_session_id: checkoutSession.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateOrderError) {
      return NextResponse.json(
        { error: updateOrderError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while starting checkout.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}