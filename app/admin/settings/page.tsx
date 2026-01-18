"use client"

import AdminLayout from "@/components/admin/layout/AdminLayout"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <AdminLayout>
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div>Loading...</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-4">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Theme Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-200">
                Appearance Mode
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    theme === "light"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    theme === "dark"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    theme === "system"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  System
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Current theme: <span className="font-semibold">{theme}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Store Settings */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Store Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Store Name</label>
              <input
                type="text"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Enter store name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Store Logo</label>
              <input type="file" className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Contact Email</label>
              <input
                type="email"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="example@store.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Contact Phone</label>
              <input
                type="text"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="+91 9876543210"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Payment Settings */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Payment Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="cod" className="w-4 h-4" />
              <label htmlFor="cod" className="text-sm dark:text-gray-200">Enable Cash on Delivery</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="razorpay" className="w-4 h-4" />
              <label htmlFor="razorpay" className="text-sm dark:text-gray-200">Enable Razorpay</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Payment API Key</label>
              <input
                type="text"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Enter API key"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Shipping Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Delivery Charges</label>
              <input
                type="number"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Enter charges"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="freeShipping" className="w-4 h-4" />
              <label htmlFor="freeShipping" className="text-sm dark:text-gray-200">
                Enable Free Shipping
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Minimum Order for Free Shipping</label>
              <input
                type="number"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Enter amount"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Notification Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="emailNotif" className="w-4 h-4" />
              <label htmlFor="emailNotif" className="text-sm dark:text-gray-200">Email Notifications</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="smsNotif" className="w-4 h-4" />
              <label htmlFor="smsNotif" className="text-sm dark:text-gray-200">SMS Notifications</label>
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Save Changes
          </button>
        </div>

        {/* Profile Settings */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Profile Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Admin Name</label>
              <input
                type="text"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Enter admin name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Email</label>
              <input
                type="email"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Update Profile
          </button>
        </div>

        {/* Password Settings */}
        <div className="bg-white dark:bg-gray-800 rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Change Password</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Current Password</label>
              <input
                type="password"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">New Password</label>
              <input
                type="password"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">Confirm New Password</label>
              <input
                type="password"
                className="w-full border dark:border-gray-600 rounded px-3 py-2 dark:bg-gray-700 dark:text-white"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Change Password
          </button>
        </div>

      </div>
    </AdminLayout>
  )
}
