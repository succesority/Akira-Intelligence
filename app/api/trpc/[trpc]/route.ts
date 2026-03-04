import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { appRouter } from "@/lib/trpc/routers";
import type { Context } from "@/lib/trpc/server";
import { getUserByOpenId } from "@/lib/db";

async function createContext(): Promise<Context> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("manus_session")?.value;
    if (!token || !process.env.JWT_SECRET) return { user: null };
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    if (payload.openId && typeof payload.openId === "string") {
      const user = await getUserByOpenId(payload.openId);
      return { user: user || null };
    }
    return { user: null };
  } catch { return { user: null }; }
}

const handler = (req: Request) => fetchRequestHandler({ endpoint: "/api/trpc", req, router: appRouter, createContext });
export { handler as GET, handler as POST };
