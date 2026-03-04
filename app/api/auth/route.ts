import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { upsertUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL("/?error=oauth_error", request.url));
  if (!code) return NextResponse.redirect(new URL("/?error=no_code", request.url));
  try {
    const oauthServerUrl = process.env.OAUTH_SERVER_URL;
    const appId = process.env.NEXT_PUBLIC_APP_ID;
    if (!oauthServerUrl || !appId) throw new Error("OAuth configuration missing");
    const tokenResponse = await fetch(`${oauthServerUrl}/oauth/token`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "authorization_code", code, app_id: appId, redirect_uri: `${request.nextUrl.origin}/api/auth` }),
    });
    if (!tokenResponse.ok) throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    const tokenData = await tokenResponse.json();
    const userInfoResponse = await fetch(`${oauthServerUrl}/oauth/userinfo`, { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
    if (!userInfoResponse.ok) throw new Error(`User info fetch failed`);
    const userInfo = await userInfoResponse.json();
    await upsertUser({ openId: userInfo.openId, name: userInfo.name, email: userInfo.email, loginMethod: "oauth", lastSignedIn: new Date() });
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET not configured");
    const secret = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({ openId: userInfo.openId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("manus_session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
    return response;
  } catch (error) {
    console.error("[OAuth] Error:", error);
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url));
  }
}
