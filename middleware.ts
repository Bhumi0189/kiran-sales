import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only run for /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // In local development allow access to /admin routes so the dev server
    // doesn't redirect while you're testing. For production the existing
    // cookie/role checks remain in effect.
    const host = request.headers.get("host") || ""
    const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1")

    if (isLocalhost) {
      // Skip auth check in local development to avoid redirect loops while testing
      return NextResponse.next()
    }

    // Try to get user from cookies in production
    const userCookie = request.cookies.get("kiran-sales-user")
    if (!userCookie) {
      // Not logged in, redirect to home
      return NextResponse.redirect(new URL("/", request.url))
    }
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value))
      if (user.role !== "admin") {
        // Not admin, redirect to home
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch {
      // Invalid cookie, redirect to home
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
