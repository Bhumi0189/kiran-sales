import useSWR from 'swr'
import { useEffect } from 'react'

export default function AddressSelect({ userId, value, onChange }: { userId: string, value: any, onChange: (addr: any) => void }) {
  const { data, error, isLoading } = useSWR(userId ? `/api/addresses?userId=${userId}` : null)

  useEffect(() => {
    if (data && data.length && !value) {
      const primary = data.find((a: any) => a.primary) || data[0]
      onChange(primary)
    }
  }, [data])

  if (!userId) return null
  if (isLoading) return <div>Loading addresses...</div>
  if (error) return <div>Error loading addresses.</div>
  if (!data || !data.length) return <div>No saved addresses. Please add one in your profile.</div>

  const sortedData = data ? [...data].sort((a, b) => a.primary ? -1 : b.primary ? 1 : 0) : []

  return (
    <div className="mb-4">
      <label className="font-medium text-gray-700 mb-1 block">Select Shipping Address</label>
      <div className="space-y-2">
        {sortedData.map((addr: any) => (
          <label key={addr._id} className={`flex items-start gap-2 p-3 border rounded cursor-pointer ${value && value._id === addr._id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
            <input
              type="radio"
              name="shippingAddress"
              checked={value && value._id === addr._id}
              onChange={() => onChange(addr)}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="font-semibold">{addr.name}</div>
              <div>{addr.address}, {addr.city} - {addr.pincode}</div>
              <div>{addr.phone}</div>
              {addr.primary && <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">Primary</span>}
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
