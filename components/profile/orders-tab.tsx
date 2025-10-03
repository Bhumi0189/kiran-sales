// OrdersTab: Shows user's confirmed & paid orders
import useSWR from 'swr'
import { Spinner } from '@/components/ui/spinner'

import { useAuth } from '@/lib/auth-context'

export default function OrdersTab() {
  const { state } = useAuth();
  const user = state.user;
  const email = user?.email;
  const { data, error, isLoading } = useSWR(email ? `/api/orders?email=${encodeURIComponent(email)}` : null);
  if (isLoading) return <Spinner />;
  if (error) return <div>Error loading orders.</div>;
  if (!data || !data.orders || data.orders.length === 0) return <div>No orders found.</div>;
  return (
    <ul className="space-y-2">
      {data.orders.map((order: any) => (
        <li key={order._id || order.id} className="border rounded p-2">
          <div>Order #{order.orderId || order._id || order.id}</div>
          <div>Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A')}</div>
          <div>Total: ₹{order.totalAmount ?? order.total ?? 'N/A'}</div>
          <div>Status: {order.paymentStatus ?? order.status ?? 'N/A'}</div>
          <div>Delivery: {order.deliveryStatus ?? 'N/A'}</div>
        </li>
      ))}
    </ul>
  );
}
