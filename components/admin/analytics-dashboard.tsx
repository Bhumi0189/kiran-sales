import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
// @ts-ignore
// eslint-disable-next-line
import type { Bar as BarType } from "react-chartjs-2";
import AnalyticsMetricCard from "./analytics-metric-card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../ui/table";
import { Input } from "../ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

// Main analytics dashboard component
export default function AnalyticsDashboard() {

  // State for all analytics
  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [filters, setFilters] = useState<any>({});
  const [filterOptions, setFilterOptions] = useState<any>({ paymentMethods: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [group, setGroup] = useState("day");
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all analytics data
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      // Metrics
      const metricsRes = await fetch("/api/admin/analytics/metrics", { headers: { authorization: "Bearer admin-token" } });
      const metricsData = await metricsRes.json();
      setMetrics(metricsData);
      // Orders
      const params = new URLSearchParams();
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);
      if (filters.status) params.append("status", filters.status);
      if (filters.payment) params.append("payment", filters.payment);
      if (filters.category) params.append("category", filters.category);
      const ordersRes = await fetch(`/api/admin/analytics/orders?${params.toString()}`, { headers: { authorization: "Bearer admin-token" } });
      const ordersData = await ordersRes.json();
      setOrders(ordersData);
      // Revenue chart
      const revParams = new URLSearchParams();
      if (dateRange.from) revParams.append("from", dateRange.from);
      if (dateRange.to) revParams.append("to", dateRange.to);
      revParams.append("group", group);
      const revenueRes = await fetch(`/api/admin/analytics/revenue?${revParams.toString()}`, { headers: { authorization: "Bearer admin-token" } });
      setRevenueData(await revenueRes.json());
      // Breakdown
      const breakdownRes = await fetch("/api/admin/analytics/breakdown", { headers: { authorization: "Bearer admin-token" } });
      setBreakdown(await breakdownRes.json());
      // Filter options
      const filterRes = await fetch("/api/admin/analytics/filters", { headers: { authorization: "Bearer admin-token" } });
      setFilterOptions(await filterRes.json());
    } catch (err: any) {
      setError(err.message || "Error fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  // Polling for real-time updates
  useEffect(() => {
    fetchAll();
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(fetchAll, 10000); // 10s
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    // eslint-disable-next-line
  }, [dateRange, filters, group]);

  // Filtered orders (search)
  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    return (
      o._id?.toString().includes(search) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase())
    );
  });


  // Chart.js via react-chartjs-2 (client only)
  const Bar: typeof BarType = dynamic(() => import("react-chartjs-2").then(mod => mod.Bar), { ssr: false }) as any;
  const chartData = {
    labels: revenueData.map((d: any) => d._id),
    datasets: [
      {
        label: "Revenue",
        data: revenueData.map((d: any) => d.totalRevenue),
        backgroundColor: "#4f46e5",
        yAxisID: 'y',
      },
      {
        label: "Orders",
        data: revenueData.map((d: any) => d.orderCount),
        backgroundColor: "#22d3ee",
        yAxisID: 'y1',
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Revenue' } },
      y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Orders' } },
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Metrics Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <AnalyticsMetricCard
            title="Total Orders"
            value={loading ? "..." : metrics?.totalOrders ?? "-"}
            icon={<span role="img" aria-label="orders">📦</span>}
          />
          <AnalyticsMetricCard
            title="Total Revenue"
            value={loading ? "..." : metrics?.totalRevenue?.toLocaleString?.("en-IN", { style: "currency", currency: "INR" }) ?? "-"}
            icon={<span role="img" aria-label="revenue">💰</span>}
          />
          <AnalyticsMetricCard
            title="Total Customers"
            value={loading ? "..." : metrics?.totalCustomers ?? "-"}
            icon={<span role="img" aria-label="customers">👤</span>}
          />
          <AnalyticsMetricCard
            title="Pending / Completed / Cancelled"
            value={loading ? "..." : `${metrics?.statusCounts?.pending ?? 0} / ${metrics?.statusCounts?.completed ?? 0} / ${metrics?.statusCounts?.cancelled ?? 0}`}
            icon={<span role="img" aria-label="status">📊</span>}
          />
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </section>

      {/* Filters */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter by date, status, payment, category, search</CardDescription>
          </CardHeader>
          <div className="flex flex-wrap gap-4 p-4 items-end">
            <div>
              <label className="block text-xs mb-1">Date From</label>
              <Input type="date" value={dateRange.from} onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs mb-1">Date To</label>
              <Input type="date" value={dateRange.to} onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs mb-1">Status</label>
              <Select value={filters.status || ""} onValueChange={(v: string) => setFilters((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs mb-1">Payment</label>
              <Select value={filters.payment || ""} onValueChange={(v: string) => setFilters((f: any) => ({ ...f, payment: v }))}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {filterOptions.paymentMethods.map((pm: string) => (
                    <SelectItem key={pm} value={pm}>{pm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs mb-1">Category</label>
              <Select value={filters.category || ""} onValueChange={(v: string) => setFilters((f: any) => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {filterOptions.categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs mb-1">Search</label>
              <Input placeholder="Order ID or Customer Name" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1">Group By</label>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </section>

      {/* Charts Section */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders</CardTitle>
            <CardDescription>Visualize revenue and order trends</CardDescription>
          </CardHeader>
          <div className="p-4">
            {revenueData.length > 0 ? (
              <Bar data={chartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: { position: "top" as const },
                },
                scales: {
                  ...chartOptions.scales,
                  y1: {
                    ...chartOptions.scales.y1,
                    position: "right" as const,
                  },
                },
              }} height={300} />
            ) : (
              <Skeleton className="w-full h-[300px]" />
            )}
          </div>
        </Card>
      </section>

      {/* Order Analytics Table */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Order Analytics</CardTitle>
            <CardDescription>All orders with sorting and filtering</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6}><Skeleton className="w-full h-8" /></TableCell></TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow><TableCell colSpan={6}>No orders found</TableCell></TableRow>
                ) : (
                  filteredOrders.map((order: any) => (
                    <TableRow key={order._id}>
                      <TableCell>{order._id}</TableCell>
                      <TableCell>{order.customerName || order.email || order.userName || "-"}</TableCell>
                      <TableCell>{typeof order.totalAmount === 'number' ? order.totalAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "-"}</TableCell>
                      <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</TableCell>
                      <TableCell>{order.paymentMethod || "-"}</TableCell>
                      <TableCell>{order.status || "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      {/* Revenue Breakdown */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Stats, top products, payment methods</CardDescription>
          </CardHeader>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium">Total Revenue</div>
              <div className="text-2xl mb-2">{breakdown?.totalRevenue?.toLocaleString?.("en-IN", { style: "currency", currency: "INR" }) ?? "-"}</div>
              <div className="font-medium">Average Order Value</div>
              <div className="mb-2">{breakdown?.avgOrderValue?.toLocaleString?.("en-IN", { style: "currency", currency: "INR" }) ?? "-"}</div>
              <div className="font-medium">Payment Methods</div>
              <ul>
                {breakdown?.paymentCounts && Object.entries(breakdown.paymentCounts).map(([method, count]: any) => (
                  <li key={method}>{method}: {count}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-medium mb-2">Top 5 Selling Products</div>
              <ol className="list-decimal ml-4">
                {breakdown?.topProducts?.length ? breakdown.topProducts.map((p: any) => (
                  <li key={p.name}>{p.name} <span className="text-xs text-gray-500">({p.count} sold)</span></li>
                )) : <li>-</li>}
              </ol>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
