"use client"

import AdminLayout from "@/components/admin/layout/AdminLayout"
import React from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminDashboardPage() {
  const { data: stats, error, isLoading, mutate } = useSWR("/api/admin/dashboard", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  // Debug: Log the stats data
  React.useEffect(() => {
    if (stats) {
      console.log("Dashboard stats:", stats)
    }
  }, [stats])

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Welcome to the Admin Dashboard</h2>
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-semibold text-lg mb-2">Total Customers</h3>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.usersCount ?? 0}
              </div>
            </div>
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-semibold text-lg mb-2">Total Orders</h3>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.ordersCount ?? 0}
              </div>
            </div>
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-semibold text-lg mb-2">Total Products</h3>
              <div className="text-3xl font-bold text-blue-600">
                {stats?.productsCount ?? 0}
              </div>
            </div>
            <div className="bg-white rounded shadow p-6">
              <h3 className="font-semibold text-lg mb-2">Total Revenue</h3>
              <div className="text-3xl font-bold text-green-600">
                ₹{stats?.revenue?.toLocaleString('en-IN') ?? '0'}
              </div>
            </div>
          </div>
          <FeedbacksAdminPanel />
        </>
      )}
    </AdminLayout>
  )
}

const FeedbacksAdminPanel = React.memo(function FeedbacksAdminPanel() {
  const { data, error, isLoading } = useSWR("/api/support", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minutes
  })
  
  if (isLoading) return <div className="mt-8 text-gray-500">Loading feedback...</div>
  if (error) return <div className="mt-8 text-red-500">Error loading feedback.</div>
  
  const feedbacks = data?.feedbacks || []
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Customer Feedback & Support</h2>
      {feedbacks.length === 0 ? (
        <div className="text-gray-500">No feedback yet.</div>
      ) : (
        <ul className="space-y-4">
          {feedbacks.slice(0, 10).map((fb: any) => (
            <li key={fb._id} className="border rounded p-4 bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-700">{fb.email}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {fb.type}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(fb.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="text-gray-800 whitespace-pre-line">{fb.message}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})