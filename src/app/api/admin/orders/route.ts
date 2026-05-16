import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminUser } from "@/lib/requireAdminUser";

type ListingForAdminOrder = {
  id: string;
  title: string;
};

type AdminOrder = {
  id: string;
  listing_id: string;
  buyer_id: string;
  buyer_phone: string | null;
  seller_id: string;
  item_amount: number;
  shipping_amount: number;
  platform_fee_amount: number;
  seller_payout_amount: number | null;
  total_amount: number;
  status: string;
  transfer_status: string | null;
  stripe_connected_account_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_transfer_id: string | null;
  shipping_carrier: string | null;
  tracking_number: string | null;
  shipped_at: string | null;
  seller_payout_released_at: string | null;
  paid_at: string | null;
  created_at: string;
  admin_issue_status: string;
  admin_issue_notes: string | null;
  admin_issue_updated_at: string | null;
  stripe_refund_id: string | null;
  refunded_at: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  listing: ListingForAdminOrder | ListingForAdminOrder[] | null;
};

function getOrderListing(order: AdminOrder) {
  if (Array.isArray(order.listing)) {
    return order.listing[0] || null;
  }

  return order.listing;
}

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminUser(request);

    if (!adminCheck.ok) {
      return adminCheck.response;
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id,listing_id,buyer_id,buyer_phone,seller_id,item_amount,shipping_amount,platform_fee_amount,seller_payout_amount,total_amount,status,transfer_status,stripe_connected_account_id,stripe_payment_intent_id,stripe_charge_id,stripe_transfer_id,shipping_carrier,tracking_number,shipped_at,seller_payout_released_at,paid_at,created_at,admin_issue_status,admin_issue_notes,admin_issue_updated_at,stripe_refund_id,refunded_at,refund_amount,refund_reason,listing:listings(id,title)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = ((data || []) as AdminOrder[]).map((order) => {
      const listing = getOrderListing(order);

      return {
        ...order,
        listing,
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while loading admin orders.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
