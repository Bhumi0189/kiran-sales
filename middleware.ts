import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only run for /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Try to get user from localStorage (not available in middleware), so use cookies or headers
    // For demo, check for a cookie named 'kiran-sales-user'
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
