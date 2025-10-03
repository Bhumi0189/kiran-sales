import AdminLayout from "@/components/admin/layout/AdminLayout"
import { OrdersTab } from "@/components/admin/orders-tab"

export default function OrdersPage() {
  return (
    <AdminLayout>
      <OrdersTab />
    </AdminLayout>
  )
}
