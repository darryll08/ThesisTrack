import NextAuth from "next-auth";
import { type NextFetchEvent, type NextRequest } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

type AuthProxy = (
  request: NextRequest,
  event: NextFetchEvent,
) => Promise<Response>;

// Auth.js v5 beta exposes several overloaded `auth` signatures. Next.js 16
// invokes this export with the middleware signature at runtime, so narrow that
// specific overload here while keeping the proxy export explicit for Next's
// static route analysis.
const authProxy = auth as unknown as AuthProxy;

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return authProxy(request, event);
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
