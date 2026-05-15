import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeWebhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET environment variable." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid Stripe webhook.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      const listingId = session.metadata?.listingId;
      const offerId = session.metadata?.offerId;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id || null;
      const buyerPhone = session.customer_details?.phone || null;

      if (!orderId || !listingId) {
        return NextResponse.json(
          { error: "Missing order or listing metadata." },
          { status: 400 }
        );
      }

      const paidAt = new Date().toISOString();

      const { error: orderUpdateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: paymentIntentId,
          buyer_phone: buyerPhone,
          paid_at: paidAt,
          updated_at: paidAt,
        })
        .eq("id", orderId);

      if (orderUpdateError) {
        return NextResponse.json(
          { error: orderUpdateError.message },
          { status: 500 }
        );
      }

      const { error: listingUpdateError } = await supabaseAdmin
        .from("listings")
        .update({
          status: "sold",
        })
        .eq("id", listingId)
        .eq("status", "active");

      if (listingUpdateError) {
        return NextResponse.json(
          { error: listingUpdateError.message },
          { status: 500 }
        );
      }

      if (offerId) {
        const { error: paidOfferUpdateError } = await supabaseAdmin
          .from("offers")
          .update({
            status: "paid",
            updated_at: paidAt,
          })
          .eq("id", offerId)
          .eq("listing_id", listingId);

        if (paidOfferUpdateError) {
          return NextResponse.json(
            { error: paidOfferUpdateError.message },
            { status: 500 }
          );
        }

        const { error: otherOffersUpdateError } = await supabaseAdmin
          .from("offers")
          .update({
            status: "declined",
            updated_at: paidAt,
          })
          .eq("listing_id", listingId)
          .eq("status", "pending")
          .neq("id", offerId);

        if (otherOffersUpdateError) {
          return NextResponse.json(
            { error: otherOffersUpdateError.message },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while handling the Stripe webhook.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}