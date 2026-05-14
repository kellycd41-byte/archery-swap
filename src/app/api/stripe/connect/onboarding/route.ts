import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "You must be signed in to set up payouts." },
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
        { error: "Please sign in again before setting up payouts." },
        { status: 401 }
      );
    }

    const { data: existingPayoutAccount, error: existingAccountError } =
      await supabase
        .from("seller_payout_accounts")
        .select("stripe_account_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (existingAccountError) {
      return NextResponse.json(
        { error: existingAccountError.message },
        { status: 500 }
      );
    }

    let stripeAccountId = existingPayoutAccount?.stripe_account_id || "";

    if (!stripeAccountId) {
      const stripeAccount = await stripe.accounts.create({
        type: "express",
        email: user.email || undefined,
        capabilities: {
          card_payments: {
            requested: true,
          },
          transfers: {
            requested: true,
          },
        },
        business_type: "individual",
      });

      stripeAccountId = stripeAccount.id;

      const { error: insertError } = await supabase
        .from("seller_payout_accounts")
        .insert({
          user_id: user.id,
          stripe_account_id: stripeAccountId,
          charges_enabled: stripeAccount.charges_enabled,
          payouts_enabled: stripeAccount.payouts_enabled,
          details_submitted: stripeAccount.details_submitted,
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${siteUrl}/account?stripe_onboarding=refresh`,
      return_url: `${siteUrl}/account?stripe_onboarding=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong while starting Stripe onboarding.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}