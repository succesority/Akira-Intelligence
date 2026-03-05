export const PROJECT_NAME = "Akira Intelligence";
export const PROJECT_TAGLINE = "Neural Architectural Synthesis Engine";
export const APP_TITLE = "Akira Intelligence";
export const APP_LOGO = "/LOGO.png";
export const COOKIE_NAME = "manus_session";

export function getLoginUrl() {
  const portalUrl = process.env.NEXT_PUBLIC_OAUTH_PORTAL_URL || "https://manus.im";
  const appId = process.env.NEXT_PUBLIC_APP_ID || "";
  if (typeof window === "undefined") return `${portalUrl}/oauth?app=${appId}`;
  const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth`);
  return `${portalUrl}/oauth?app=${appId}&redirect_uri=${redirectUri}`;
}
