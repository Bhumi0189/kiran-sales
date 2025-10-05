"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

// Usage: Wrap your page/component with <ClientGuard>{children}</ClientGuard>
export default function ClientGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't run redirects while auth state is loading (prevents transient redirects)
    if (state.isLoading) return

    // Only redirect admin users when they're not already on an /admin route
    if (state.user?.role === "admin" && !pathname?.startsWith("/admin")) {
      router.replace("/admin")
    }

    // Optionally, you can add more role-based redirects here
  }, [state.user, state.isLoading, router, pathname])

  return <>{children}</>
}
