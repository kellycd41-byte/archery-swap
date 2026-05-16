import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminUser } from "@/lib/requireAdminUser";
import { sendEmail } from "@/lib/email";

type OrderListingForRefund = {
  id: string;
  title: string;
};

type OrderForRefund = {
  id: string;
  buyer_id: string;
  status: string;
  transfer_status: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_transfer_id: string | null;
  stripe_refund_id: string | null;
  total_amount: number;
  refunded_at: string | null;
  listing: OrderListingForRefund | OrderListingForRefund[] | null;
};

function getOrderListing(order: OrderForRefund) {
  if (Array.isArray(order.listing)) {
    return order.listing[0] || null;
  }

  return order.listing;
}

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
      refundReason?: string;
    };

    const orderId = body.orderId?.trim();
    const refundReason =
      body.refundReason?.trim() ||
      "Admin refund approved through Archery Outlet.";

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
        "id,buyer_id,status,transfer_status,stripe_payment_intent_id,stripe_charge_id,stripe_transfer_id,stripe_refund_id,total_amount,refunded_at,listing:listings(id,title)"
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

    const order = orderData as OrderForRefund;

    if (order.refunded_at || order.stripe_refund_id || order.status === "refunded") {
      return NextResponse.json(
        { error: "This order has already been refunded." },
        { status: 400 }
      );
    }

    if (order.transfer_status === "released" || order.stripe_transfer_id) {
      return NextResponse.json(
        {
          error:
            "Seller payout has already been released. This first refund tool only supports refunds before seller payout release.",
        },
        { status: 400 }
      );
    }

    if (order.status !== "paid" && order.status !== "shipped") {
      return NextResponse.json(
        { error: "Only paid or shipped orders can be refunded." },
        { status: 400 }
      );
    }

    if (!order.stripe_payment_intent_id && !order.stripe_charge_id) {
      return NextResponse.json(
        { error: "Missing Stripe payment information for this order." },
        { status: 400 }
      );
    }

    const refundAmount = Number(order.total_amount) || 0;
    const refundAmountCents = dollarsToCents(refundAmount);

    if (refundAmountCents <= 0) {
      return NextResponse.json(
        { error: "Refund amount is invalid." },
        { status: 400 }
      );
    }

    let stripeChargeId = order.stripe_charge_id;

    if (!stripeChargeId && order.stripe_payment_intent_id) {
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

    const refund = await stripe.refunds.create({
      amount: refundAmountCents,
      charge: stripeChargeId || undefined,
      payment_intent: stripeChargeId ? undefined : order.stripe_payment_intent_id || undefined,
      reason: "requested_by_customer",
      metadata: {
        orderId: order.id,
        buyerId: order.buyer_id,
        refundType: "manual_admin_refund",
      },
    });

    const refundedAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "refunded",
        transfer_status: "refunded",
        stripe_refund_id: refund.id,
        stripe_charge_id: stripeChargeId,
        refunded_at: refundedAt,
        refund_amount: refundAmount,
        refund_reason: refundReason,
        admin_issue_status: "resolved",
        admin_issue_notes: refundReason,
        admin_issue_updated_at: refundedAt,
        updated_at: refundedAt,
      })
      .eq("id", order.id)
      .is("stripe_refund_id", null);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const {
      data: { user: buyerUser },
      error: buyerUserError,
    } = await supabaseAdmin.auth.admin.getUserById(order.buyer_id);

    if (buyerUserError) {
      console.error("Could not load buyer email:", buyerUserError.message);
    }

    const buyerEmail = buyerUser?.email || "";
    const listing = getOrderListing(order);
    const listingTitle = listing?.title || "your order";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://archeryoutlet.net";
    const accountUrl = `${siteUrl}/account`;
    const refundText = `$${refundAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    if (buyerEmail) {
      try {
        await sendEmail({
          to: buyerEmail,
          subject: `Your Archery Outlet order was refunded: ${listingTitle}`,
          text: `Your order for ${listingTitle} was refunded. Refund amount: ${refundText}. Bank and card processing timing may vary. You can view your order here: ${accountUrl}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1917;">
              <h2 style="margin: 0 0 12px;">Your order was refunded</h2>
              <p>Your order for <strong>${listingTitle}</strong> was refunded.</p>
              <p><strong>Refund amount:</strong> ${refundText}</p>
              <p>
                <a href="${accountUrl}" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 10px; text-decoration: none; font-weight: bold;">
                  Open My Orders
                </a>
              </p>
              <p style="font-size: 13px; color: #57534e;">
                Bank and card processing timing may vary after a refund is issued.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Buyer refund email failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      refundedAt,
      refundAmount,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while refunding the buyer.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
