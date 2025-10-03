"use client"
import React from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Settings", href: "/admin/settings" },
]

export const AdminSidebar = React.memo(function AdminSidebar() {
  const { state, logout } = useAuth()
  const router = useRouter()

  const handleLogout = React.useCallback(() => {
    logout()
    router.push("/")
  }, [logout, router])

  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-700 tracking-wide">Admin Panel</h1>
        <p className="text-xs text-gray-500 mt-1">{state.user?.role?.toUpperCase()}</p>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-700 font-medium"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t flex flex-col gap-2">
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          Log out
        </Button>
        <span className="block text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} Kiran Sales</span>
      </div>
    </aside>
  )
})
