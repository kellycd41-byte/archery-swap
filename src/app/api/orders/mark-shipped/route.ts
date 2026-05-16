import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";

type OrderListingForShipment = {
  id: string;
  title: string;
};

type OrderForShipment = {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  transfer_status: string | null;
  shipped_at: string | null;
  listing: OrderListingForShipment | OrderListingForShipment[] | null;
};

function getOrderListing(order: OrderForShipment) {
  if (Array.isArray(order.listing)) {
    return order.listing[0] || null;
  }

  return order.listing;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "You must be signed in to mark an order shipped." },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      orderId?: string;
      shippingCarrier?: string;
      trackingNumber?: string;
    };

    const orderId = body.orderId?.trim();
    const shippingCarrier = body.shippingCarrier?.trim();
    const trackingNumber = body.trackingNumber?.trim();

    if (!orderId) {
      return NextResponse.json(
        { error: "Missing order id." },
        { status: 400 }
      );
    }

    if (!shippingCarrier) {
      return NextResponse.json(
        { error: "Please enter the shipping carrier." },
        { status: 400 }
      );
    }

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Please enter the tracking number." },
        { status: 400 }
      );
    }

    if (shippingCarrier.length > 80) {
      return NextResponse.json(
        { error: "Shipping carrier is too long." },
        { status: 400 }
      );
    }

    if (trackingNumber.length > 120) {
      return NextResponse.json(
        { error: "Tracking number is too long." },
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
        { error: "Please sign in again before updating this order." },
        { status: 401 }
      );
    }

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id,buyer_id,seller_id,status,transfer_status,shipped_at,listing:listings(id,title)")
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

    const order = orderData as OrderForShipment;

    if (order.seller_id !== user.id) {
      return NextResponse.json(
        { error: "You can only update orders from your own sold listings." },
        { status: 403 }
      );
    }

    if (order.status !== "paid") {
      return NextResponse.json(
        { error: "Only paid orders can be marked shipped." },
        { status: 400 }
      );
    }

    if (order.transfer_status !== "not_released") {
      return NextResponse.json(
        { error: "This order payout has already been updated." },
        { status: 400 }
      );
    }

    if (order.shipped_at) {
      return NextResponse.json(
        { error: "This order has already been marked shipped." },
        { status: 400 }
      );
    }

    const shippedAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "shipped",
        shipping_carrier: shippingCarrier,
        tracking_number: trackingNumber,
        shipped_at: shippedAt,
        updated_at: shippedAt,
      })
      .eq("id", order.id)
      .eq("seller_id", user.id)
      .eq("status", "paid");

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

    if (buyerEmail) {
      try {
        await sendEmail({
          to: buyerEmail,
          subject: `Your Archery Outlet order shipped: ${listingTitle}`,
          text: `Your Archery Outlet order has shipped. Item: ${listingTitle}. Carrier: ${shippingCarrier}. Tracking: ${trackingNumber}. You can view your order here: ${accountUrl}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1917;">
              <h2 style="margin: 0 0 12px;">Your order has shipped</h2>
              <p>Your order for <strong>${listingTitle}</strong> has been marked shipped.</p>
              <p><strong>Carrier:</strong> ${shippingCarrier}</p>
              <p><strong>Tracking:</strong> ${trackingNumber}</p>
              <p>
                <a href="${accountUrl}" style="display: inline-block; background: #059669; color: #ffffff; padding: 12px 18px; border-radius: 10px; text-decoration: none; font-weight: bold;">
                  Open My Orders
                </a>
              </p>
              <p style="font-size: 13px; color: #57534e;">
                Please use the carrier tracking number above to follow the shipment.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Buyer shipped email failed:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      status: "shipped",
      shippedAt,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while marking this order shipped.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
