import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { requireAdminUser } from "@/lib/requireAdminUser";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdminUser(request);

    if (!adminCheck.ok) {
      return adminCheck.response;
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.admin.getUserById(adminCheck.userId);

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: "Could not find admin email address." },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to: user.email,
      subject: "Archery Outlet email test",
      text: "This is a test email from Archery Outlet. If you received this, SMTP email sending is working.",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1917;">
          <h2>Archery Outlet email test</h2>
          <p>This is a test email from Archery Outlet.</p>
          <p>If you received this, SMTP email sending is working.</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      sentTo: user.email,
      skipped: result.skipped,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while sending the test email.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
