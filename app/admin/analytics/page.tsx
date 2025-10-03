"use client"

import AdminLayout from "@/components/admin/layout/AdminLayout"
import { useEffect, useMemo } from "react"
import { Pie, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { format, parse } from "date-fns"
import useSWR from "swr"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface MetricData {
  _id: string
  totalCustomers?: number
  totalRevenue?: number
  orderCount?: number
}

interface DashboardStats {
  usersCount: number
  ordersCount: number
  productsCount: number
  revenue: number
}

const fetcher = (url: string) => 
  fetch(url, {
    headers: { authorization: "Bearer admin-token" },
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })

export default function AdminPage() {
  // Fetch dashboard stats for total counts
  const { data: dashboardStats } = useSWR<DashboardStats>(
    "/api/admin/dashboard",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  // Use SWR for real-time data fetching with auto-refresh
  const { data: customerData = [], error: customerError, isLoading: customerLoading } = useSWR<MetricData[]>(
    "/api/admin/analytics/customers?group=month",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const { data: orderData = [], error: orderError, isLoading: orderLoading } = useSWR<MetricData[]>(
    "/api/admin/analytics/orders?group=month",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  const { data: revenueData = [], error: revenueError, isLoading: revenueLoading } = useSWR<MetricData[]>(
    "/api/admin/analytics/revenue?group=month",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  // Debug: Log all data
  useEffect(() => {
    console.log("=== ANALYTICS DEBUG ===")
    console.log("Dashboard Stats:", dashboardStats)
    console.log("Customer Data:", customerData)
    console.log("Order Data:", orderData)
    console.log("Revenue Data:", revenueData)
    console.log("=====================")
  }, [dashboardStats, customerData, orderData, revenueData])

  const loading = customerLoading || orderLoading || revenueLoading
  const error = customerError || orderError || revenueError

  if (loading) {
    return (
      <AdminLayout>
        <h2 className="text-xl font-bold mb-4">Admin Analytics</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading real-time analytics data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <h2 className="text-xl font-bold mb-4">Admin Analytics</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">Error: {error.message}</p>
          <p className="text-red-500 text-sm mt-2">Please check your API endpoints and try again.</p>
        </div>
      </AdminLayout>
    )
  }

  // Filter and process data
  const validCustomerData = customerData.filter(d => d._id && typeof d._id === 'string' && (d.totalCustomers || 0) > 0)
  const validOrderData = orderData.filter(d => d._id && typeof d._id === 'string' && (d.orderCount || 0) > 0)
  const validRevenueData = revenueData.filter(d => d._id && typeof d._id === 'string' && (d.totalRevenue || 0) > 0)

  // Use dashboard stats as fallback if monthly data is empty
  const totalCustomers = validCustomerData.reduce((sum, d) => sum + (d.totalCustomers || 0), 0) || dashboardStats?.usersCount || 0
  const totalOrders = validOrderData.reduce((sum, d) => sum + (d.orderCount || 0), 0) || dashboardStats?.ordersCount || 0
  const totalRevenue = validRevenueData.reduce((sum, d) => sum + (d.totalRevenue || 0), 0) || dashboardStats?.revenue || 0

  // Generate colors
  const generateColors = (count: number) => {
    const colors = [
      'rgba(255, 99, 132, 0.8)',
      'rgba(54, 162, 235, 0.8)',
      'rgba(255, 206, 86, 0.8)',
      'rgba(75, 192, 192, 0.8)',
      'rgba(153, 102, 255, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(199, 199, 199, 0.8)',
      'rgba(83, 102, 255, 0.8)',
      'rgba(255, 99, 255, 0.8)',
      'rgba(99, 255, 132, 0.8)',
    ]
    return Array.from({ length: count }, (_, i) => colors[i % colors.length])
  }

  const generateBorderColors = (count: number) => {
    const colors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(199, 199, 199, 1)',
      'rgba(83, 102, 255, 1)',
      'rgba(255, 99, 255, 1)',
      'rgba(99, 255, 132, 1)',
    ]
    return Array.from({ length: count }, (_, i) => colors[i % colors.length])
  }

  // Prepare customer chart data
  const customerLabels = validCustomerData.length > 0 
    ? validCustomerData.map((d) => {
        try {
          return format(parse(d._id, "yyyy-MM", new Date()), "MMM yyyy")
        } catch {
          return d._id
        }
      })
    : ['Current Period']
    
  const customerValues = validCustomerData.length > 0
    ? validCustomerData.map((d) => d.totalCustomers || 0)
    : [totalCustomers]

  const customerChartData = {
    labels: customerLabels,
    datasets: [
      {
        label: "Customers",
        data: customerValues,
        backgroundColor: generateColors(customerLabels.length),
        borderColor: generateBorderColors(customerLabels.length),
        borderWidth: 2,
      },
    ],
  }

  // Prepare order chart data
  const orderLabels = validOrderData.length > 0
    ? validOrderData.map((d) => {
        try {
          return format(parse(d._id, "yyyy-MM", new Date()), "MMM yyyy")
        } catch {
          return d._id
        }
      })
    : ['Current Period']
    
  const orderValues = validOrderData.length > 0
    ? validOrderData.map((d) => d.orderCount || 0)
    : [totalOrders]

  const orderChartData = {
    labels: orderLabels,
    datasets: [
      {
        label: "Orders",
        data: orderValues,
        backgroundColor: generateColors(orderLabels.length),
        borderColor: generateBorderColors(orderLabels.length),
        borderWidth: 2,
      },
    ],
  }

  // Prepare revenue chart data
  const revenueLabels = validRevenueData.length > 0
    ? validRevenueData.map((d) => {
        try {
          return format(parse(d._id, "yyyy-MM", new Date()), "MMM yyyy")
        } catch {
          return d._id
        }
      })
    : ['Current Period']
    
  const revenueValues = validRevenueData.length > 0
    ? validRevenueData.map((d) => d.totalRevenue || 0)
    : [totalRevenue]

  const revenueChartData = {
    labels: revenueLabels,
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueValues,
        backgroundColor: generateColors(revenueLabels.length),
        borderColor: generateBorderColors(revenueLabels.length),
        borderWidth: 2,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            const datasetLabel = context.dataset.label
            if (datasetLabel.includes('Revenue')) {
              return `${label}: ₹${value.toLocaleString('en-IN')} (${percentage}%)`
            }
            return `${label}: ${value} (${percentage}%)`
          }
        }
      },
    },
  }

  const hasCustomerData = customerValues.some(v => v > 0)
  const hasOrderData = orderValues.some(v => v > 0)
  const hasRevenueData = revenueValues.some(v => v > 0)

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Analytics</h2>
          <p className="text-gray-600 text-sm mt-1">
            Real-time data • Auto-refreshes every 30 seconds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live Data</span>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Customers</h3>
          <p className="text-3xl font-bold">{totalCustomers.toLocaleString('en-IN')}</p>
          <p className="text-xs opacity-75 mt-2">
            {validCustomerData.length > 0 ? `${validCustomerData.length} months of data` : 'All time'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">{totalOrders.toLocaleString('en-IN')}</p>
          <p className="text-xs opacity-75 mt-2">
            {validOrderData.length > 0 ? `${validOrderData.length} months of data` : 'All time'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs opacity-75 mt-2">
            {validRevenueData.length > 0 ? `${validRevenueData.length} months of data` : 'All time'}
          </p>
        </div>
      </div>



      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Customer Distribution</h3>
          {hasCustomerData ? (
            <div className="h-72">
              <Pie options={pieOptions} data={customerChartData} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">No customer data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Distribution</h3>
          {hasOrderData ? (
            <div className="h-72">
              <Doughnut options={pieOptions} data={orderChartData} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">No order data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Distribution</h3>
          {hasRevenueData ? (
            <div className="h-72">
              <Pie options={pieOptions} data={revenueChartData} />
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center bg-gray-50 rounded">
              <p className="text-gray-500">No revenue data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Data Table - Always show if we have any data */}
      {(validCustomerData.length > 0 || totalCustomers > 0) && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Monthly Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerLabels.map((label, idx) => {
                  const monthId = validCustomerData[idx]?._id
                  
                  // Try to find matching month data
                  let ordersForMonth = validOrderData.find(d => d._id === monthId)?.orderCount
                  let revenueForMonth = validRevenueData.find(d => d._id === monthId)?.totalRevenue
                  
                  // If label is "Current Period" or no matching data found, use dashboard totals
                  if (label === 'Current Period' || (ordersForMonth === undefined && validOrderData.length === 0)) {
                    ordersForMonth = dashboardStats?.ordersCount || 0
                  }
                  if (label === 'Current Period' || (revenueForMonth === undefined && validRevenueData.length === 0)) {
                    revenueForMonth = dashboardStats?.revenue || 0
                  }
                  
                  // Default to 0 if still undefined
                  ordersForMonth = ordersForMonth ?? 0
                  revenueForMonth = revenueForMonth ?? 0
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{label}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customerValues[idx].toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordersForMonth.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{revenueForMonth.toLocaleString('en-IN')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}