import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminCheckResult =
  | {
      ok: true;
      userId: string;
    }
  | {
      ok: false;
      response: NextResponse;
    };

export async function requireAdminUser(
  request: NextRequest
): Promise<AdminCheckResult> {
  const authorizationHeader = request.headers.get("authorization") || "";
  const token = authorizationHeader.replace("Bearer ", "").trim();

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin sign-in is required." },
        { status: 401 }
      ),
    };
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin sign-in could not be verified." },
        { status: 401 }
      ),
    };
  }

  const { data: adminUser, error: adminError } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminError) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: adminError.message },
        { status: 500 }
      ),
    };
  }

  if (!adminUser) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Admin access is required." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true,
    userId: user.id,
  };
}
