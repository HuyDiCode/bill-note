import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // Đảm bảo cookie được thiết lập đúng cách
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      // Thiết lập cookie từ session
      const cookieStore = await cookies();
      cookieStore.set("sb-access-token", session.access_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: session.expires_in,
      });

      cookieStore.set("sb-refresh-token", session.refresh_token, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: session.expires_in,
      });
    }

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
