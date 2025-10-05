"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Mail, Phone, Calendar, Shield, User } from "lucide-react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  status: string
  createdAt: string
  totalOrders?: number
  totalSpent?: number
}

export function UsersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const roles = ["customer", "admin"]
  const statuses = ["active", "inactive", "suspended"]

  React.useEffect(() => {
    let isMounted = true
    let interval: NodeJS.Timeout

    const fetchUsers = async (isInitial = false) => {
      try {
        if (isInitial) setLoading(true)
        
        const res = await fetch("/api/users", {
          headers: {
            authorization: "Bearer admin-token",
          },
        })
        if (!res.ok) throw new Error("Failed to fetch users")
        const data = await res.json()
        
        if (isMounted) {
          const usersArray = Array.isArray(data) ? data : []
          
          // Fetch all orders once
          const ordersRes = await fetch("/api/orders", {
            headers: { authorization: "Bearer admin-token" },
          })
          
          let allOrders = []
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json()
            allOrders = Array.isArray(ordersData) ? ordersData : []
          }
          
          // Calculate stats for each user individually
          const usersWithStats = usersArray.map((user) => {
            // Only calculate for customers
            if (user.role === "customer") {
              // Filter orders that belong ONLY to this specific user
              const userOrders = allOrders.filter((order: any) => {
                // Get the user ID from the order (check multiple possible fields)
                const orderUserId = order.userId || order.customerId || order.customer?.id || order.customer?._id
                const orderUserEmail = order.customerEmail || order.customer?.email
                
                // Match by ID or email
                const matchesById = orderUserId && (orderUserId === user.id || orderUserId === user._id)
                const matchesByEmail = orderUserEmail && orderUserEmail === user.email
                
                return matchesById || matchesByEmail
              })
              
              // Calculate this user's specific totals
              const totalOrders = userOrders.length
              const totalSpent = userOrders.reduce((sum: number, order: any) => {
                const orderAmount = order.total || order.totalAmount || 0
                return sum + orderAmount
              }, 0)
              
              console.log(`User ${user.firstName} ${user.lastName}: ${totalOrders} orders, ₹${totalSpent} spent`)
              
              return { ...user, totalOrders, totalSpent }
            }
            // Admins don't have order stats
            return { ...user, totalOrders: 0, totalSpent: 0 }
          })
          
          setUsers(usersWithStats)
        }
      } catch (error) {
        console.error("Error fetching users:", error)
        if (isMounted) setUsers([])
      } finally {
        if (isInitial && isMounted) setLoading(false)
      }
    }

    fetchUsers(true)
    interval = setInterval(() => fetchUsers(false), 5000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === "all" || user.role === selectedRole
    const matchesStatus = selectedStatus === "all" || user.status === selectedStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "customer":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update user status")

      setUsers(users.map((user) => (user.id === userId ? { ...user, status: newStatus } : user)))
    } catch (error) {
      console.error("Failed to update user status:", error)
      alert("Failed to update user status")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Users Management</h2>
        <p className="text-gray-600 mt-1">Manage customer accounts and administrators</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.status === "active").length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.role === "customer").length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <User className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administrators</p>
                <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.role === "admin").length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()

          return (
            <Card key={user.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-lg font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {user.firstName} {user.lastName}
                        </h3>
                        <Badge className={`${getRoleColor(user.role)} border`}>
                          {user.role === "admin" ? (
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Admin
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> Customer
                            </span>
                          )}
                        </Badge>
                        <Badge className={`${getStatusColor(user.status)} border`}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {user.role === "customer" && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-200">
                        <p className="font-bold text-gray-900">{user.totalOrders || 0} Orders</p>
                        <p className="text-sm text-gray-600">₹{(user.totalSpent || 0).toLocaleString()} Spent</p>
                      </div>
                    )}

                    <Select value={user.status} onValueChange={(value) => updateUserStatus(user.id, value)}>
                      <SelectTrigger className="w-32 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="text-center py-16">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500 font-medium">No users found matching your criteria</p>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}