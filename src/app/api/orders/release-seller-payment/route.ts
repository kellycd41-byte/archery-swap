import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminUser } from "@/lib/requireAdminUser";

type OrderForRelease = {
  id: string;
  seller_id: string;
  status: string;
  transfer_status: string | null;
  stripe_connected_account_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_transfer_id: string | null;
  seller_payout_amount: number | null;
  shipping_carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
};

function dollarsToCents(value: number) {
  return Math.round(value * 100);
}

function getChargeIdFromPaymentIntent(paymentIntent: Stripe.PaymentIntent) {
  if (typeof paymentIntent.latest_charge === "string") {
    return paymentIntent.latest_charge;
  }

  return paymentIntent.latest_charge?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      orderId?: string;
    };

    const orderId = body.orderId?.trim();

    const adminCheck = await requireAdminUser(request);

    if (!adminCheck.ok) {
      return adminCheck.response;
    }

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order id." },
        { status: 400 }
      );
    }

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .select(
        "id,seller_id,status,transfer_status,stripe_connected_account_id,stripe_payment_intent_id,stripe_charge_id,stripe_transfer_id,seller_payout_amount,shipping_carrier,tracking_number,shipped_at"
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    if (!orderData) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    const order = orderData as OrderForRelease;

    if (order.status !== "shipped") {
      return NextResponse.json(
        {
          error:
            "Only shipped orders can be released. Verify shipment before releasing seller payment.",
        },
        { status: 400 }
      );
    }

    if (order.transfer_status !== "not_released") {
      return NextResponse.json(
        { error: "Seller payment has already been released or updated." },
        { status: 400 }
      );
    }

    if (order.stripe_transfer_id) {
      return NextResponse.json(
        { error: "This order already has a Stripe transfer." },
        { status: 400 }
      );
    }

    if (!order.shipping_carrier || !order.tracking_number || !order.shipped_at) {
      return NextResponse.json(
        {
          error:
            "Shipment information is required before seller payment can be released.",
        },
        { status: 400 }
      );
    }

    if (!order.stripe_connected_account_id) {
      return NextResponse.json(
        { error: "Missing seller Stripe connected account." },
        { status: 400 }
      );
    }

    if (!order.stripe_payment_intent_id) {
      return NextResponse.json(
        { error: "Missing Stripe payment intent." },
        { status: 400 }
      );
    }

    const sellerPayoutAmount = Number(order.seller_payout_amount) || 0;
    const sellerPayoutCents = dollarsToCents(sellerPayoutAmount);

    if (sellerPayoutCents <= 0) {
      return NextResponse.json(
        { error: "Seller payout amount is invalid." },
        { status: 400 }
      );
    }

    let stripeChargeId = order.stripe_charge_id;

    if (!stripeChargeId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        order.stripe_payment_intent_id,
        {
          expand: ["latest_charge"],
        }
      );

      stripeChargeId = getChargeIdFromPaymentIntent(paymentIntent);

      if (!stripeChargeId) {
        return NextResponse.json(
          { error: "Could not find the Stripe charge for this order." },
          { status: 400 }
        );
      }
    }

    const transfer = await stripe.transfers.create({
      amount: sellerPayoutCents,
      currency: "usd",
      destination: order.stripe_connected_account_id,
      source_transaction: stripeChargeId,
      metadata: {
        orderId: order.id,
        sellerId: order.seller_id,
        releaseType: "manual_admin_release",
      },
    });

    const releasedAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        transfer_status: "released",
        stripe_transfer_id: transfer.id,
        stripe_charge_id: stripeChargeId,
        seller_payout_released_at: releasedAt,
        updated_at: releasedAt,
      })
      .eq("id", order.id)
      .eq("transfer_status", "not_released");

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transferId: transfer.id,
      releasedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while releasing seller payment.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
