import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { stripe } from "@/lib/stripe";
import { sendEmail } from "@/lib/email";

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

      const { data: orderForEmail, error: orderEmailError } = await supabaseAdmin
        .from("orders")
        .select(
          "id,seller_id,item_amount,shipping_amount,total_amount,ship_by_date,listing:listings(id,title)"
        )
        .eq("id", orderId)
        .maybeSingle();

      if (orderEmailError) {
        console.error("Could not load order for seller email:", orderEmailError.message);
      }

      if (orderForEmail?.seller_id) {
        const { data: sellerUserData, error: sellerUserError } =
          await supabaseAdmin.auth.admin.getUserById(orderForEmail.seller_id);

        if (sellerUserError) {
          console.error("Could not load seller email:", sellerUserError.message);
        }

        const sellerEmail = sellerUserData?.user?.email || "";
        const listing = Array.isArray(orderForEmail.listing)
          ? orderForEmail.listing[0]
          : orderForEmail.listing;
        const listingTitle = listing?.title || "your item";
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL || "https://archeryoutlet.net";
        const accountUrl = `${siteUrl}/account`;
        const shipByText = orderForEmail.ship_by_date
          ? new Date(orderForEmail.ship_by_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "as soon as possible";

        if (sellerEmail) {
          try {
            await sendEmail({
              to: sellerEmail,
              subject: `Your Archery Outlet item sold: ${listingTitle}`,
              text: `Good news — your item sold on Archery Outlet. Item: ${listingTitle}. Please sign in to your account, open My Orders, and add carrier and tracking. Ship by: ${shipByText}. ${accountUrl}`,
              html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1917;">
                  <h2 style="margin: 0 0 12px;">Your item sold on Archery Outlet</h2>
                  <p>Good news — <strong>${listingTitle}</strong> has sold.</p>
                  <p>Please sign in to your account, open <strong>My Orders</strong>, and add the carrier and tracking number after you ship.</p>
                  <p><strong>Ship by:</strong> ${shipByText}</p>
                  <p>
                    <a href="${accountUrl}" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 10px; text-decoration: none; font-weight: bold;">
                      Open My Orders
                    </a>
                  </p>
                  <p style="font-size: 13px; color: #57534e;">
                    Seller payout stays held until shipment is reviewed and released.
                  </p>
                </div>
              `,
            });
          } catch (emailError) {
            console.error("Seller order email failed:", emailError);
          }
        }
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