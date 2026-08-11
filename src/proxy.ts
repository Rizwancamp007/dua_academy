import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const authProxy = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 1. Check if user is approved
    if (token && !token.isApproved && path !== "/pending-approval") {
      return NextResponse.redirect(new URL("/pending-approval", req.url));
    }

    // 2. Admin role check
    if (path.startsWith("/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. Clerk role check
    if (path.startsWith("/clerk") && !["clerk", "admin"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 4. Teacher role check
    if (path.startsWith("/teacher") && !["teacher", "admin"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 5. Student dashboard check
    if (path.startsWith("/student") && !["student", "clerk", "teacher", "admin"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token && !!token.id,
    },
  }
);

export default function proxy(req: any, event: any) {
  return authProxy(req, event);
}

export const config = {
  matcher: [
    "/student/:path*",
    "/clerk/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/pending-approval",
  ],
};
