"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

// Usage: Wrap your page/component with <ClientGuard>{children}</ClientGuard>
export default function ClientGuard({ children }: { children: React.ReactNode }) {
  const { state } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (state.user?.role === "admin") {
      router.replace("/admin")
    }
    // Optionally, you can add more role-based redirects here
  }, [state.user, router])

  return <>{children}</>
}
