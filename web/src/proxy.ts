import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed "middleware" to "proxy" (same underlying mechanism).
// next-intl's request handler is a drop-in NextRequest -> NextResponse
// function, so it's exported directly under the new convention.
export const proxy = createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
