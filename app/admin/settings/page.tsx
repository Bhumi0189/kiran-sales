import AdminLayout from "@/components/admin/layout/AdminLayout";

export default function SettingsPage() {
  return (
    <AdminLayout>
      <h2 className="text-xl font-bold mb-4">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Store Settings */}
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Store Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter store name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Logo</label>
              <input type="file" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email</label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2"
                placeholder="example@store.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="+91 9876543210"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Save Changes
          </button>
        </div>

        {/* Payment Settings */}
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="cod" className="w-4 h-4" />
              <label htmlFor="cod" className="text-sm">Enable Cash on Delivery</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="razorpay" className="w-4 h-4" />
              <label htmlFor="razorpay" className="text-sm">Enable Razorpay</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment API Key</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter API key"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Save Changes
          </button>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Shipping Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Charges</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter charges"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="freeShipping" className="w-4 h-4" />
              <label htmlFor="freeShipping" className="text-sm">
                Enable Free Shipping
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimum Order for Free Shipping</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter amount"
              />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Save Changes
          </button>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="emailNotif" className="w-4 h-4" />
              <label htmlFor="emailNotif" className="text-sm">Email Notifications</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="smsNotif" className="w-4 h-4" />
              <label htmlFor="smsNotif" className="text-sm">SMS Notifications</label>
            </div>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Save Changes
          </button>
        </div>

      </div>
    </AdminLayout>
  );
}
