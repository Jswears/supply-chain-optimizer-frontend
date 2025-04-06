// import { fetchAuthSession } from "aws-amplify/auth/server";
// import { NextRequest, NextResponse } from "next/server";
// import { runWithAmplifyServerContext } from "@/app/utils/amplifyServerUtils";

import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import {
  authenticatedUser,
  runWithAmplifyServerContext,
} from "@/lib/amplifyServerUtils";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const user = await authenticatedUser({ request, response });

  const isOnAdminPage = request.nextUrl.pathname.startsWith("/admin");

  if (isOnAdminPage) {
    if (isOnAdminPage && !user?.isAdmin) {
      return NextResponse.redirect(
        new URL("/error/not-authorized", request.nextUrl)
      );
    }
  }

  const authenticated = await runWithAmplifyServerContext({
    nextServerContext: { request, response },
    operation: async (context) => {
      try {
        const session = await fetchAuthSession(context, {});
        return session.tokens !== undefined;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  });
  if (authenticated) {
    return response;
  }
  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
