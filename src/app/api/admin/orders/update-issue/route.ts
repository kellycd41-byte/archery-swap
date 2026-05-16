import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdminUser } from "@/lib/requireAdminUser";

const allowedIssueStatuses = [
  "no_issue",
  "needs_review",
  "refund_requested",
  "resolved",
];

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminUser(request);

    if (!adminCheck.ok) {
      return adminCheck.response;
    }

    const body = (await request.json()) as {
      orderId?: string;
      adminIssueStatus?: string;
      adminIssueNotes?: string;
    };

    const orderId = body.orderId?.trim();
    const adminIssueStatus = body.adminIssueStatus?.trim() || "no_issue";
    const adminIssueNotes = body.adminIssueNotes?.trim() || null;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    if (!allowedIssueStatuses.includes(adminIssueStatus)) {
      return NextResponse.json(
        { error: "Invalid admin issue status." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        admin_issue_status: adminIssueStatus,
        admin_issue_notes: adminIssueNotes,
        admin_issue_updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while updating the admin issue notes.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
