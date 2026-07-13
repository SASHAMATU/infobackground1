import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Defense in depth: proxy.ts already redirects "/" -> "/{defaultLocale}"
// for every request (see matcher in proxy.ts), so this should never
// actually render in normal operation. It exists so that bare "/" still
// resolves to something instead of a 404 if proxy/middleware ever fails
// to run for a given deployment target.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
