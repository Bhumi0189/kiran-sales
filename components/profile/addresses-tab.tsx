// AddressesTab: Manage multiple shipping addresses
import useSWR from 'swr'
import { useState } from 'react'
import { MapPin, Star } from 'lucide-react'

// Define fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function AddressesTab({ userId }: { userId: string }) {
  // Don't fetch if userId is missing
  const shouldFetch = Boolean(userId)
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch ? `/api/addresses?userId=${encodeURIComponent(userId)}` : null,
    fetcher // Add fetcher here
  )
  
  const [form, setForm] = useState({ address: '', city: '', pincode: '', primary: false })
  const [editing, setEditing] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Add console logging for debugging
  console.log('AddressesTab - userId:', userId)
  console.log('AddressesTab - data:', data)
  console.log('AddressesTab - error:', error)

  if (!userId) return <div className="text-gray-500 italic">Please log in to manage your addresses.</div>
  if (isLoading) return <div>Loading addresses...</div>
  if (error) {
    console.error('SWR Error:', error)
    return <div className="text-red-600">Error loading addresses. Please try again.</div>
  }

  // Extract addresses array from response
  const addresses = data?.addresses || []

  const handleAdd = async (e: any) => {
    e.preventDefault()
    if (!userId) return
    
    console.log('Submitting address with userId:', userId)
    console.log('Form data:', form)
    
    setSubmitting(true)
    try {
      const payload = { userId, ...form }
      console.log('POST payload:', payload)
      
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      const responseData = await res.json()
      console.log('POST response:', responseData, 'Status:', res.status)
      
      if (!res.ok) {
        console.error('Server error:', responseData)
        alert(responseData.error || 'Failed to save address')
        setSubmitting(false)
        return
      }
      
      // Reset form and close
      setForm({ address: '', city: '', pincode: '', primary: false })
      setShowForm(false)
      
      // Force a fresh fetch
      await mutate()
      console.log('Address added successfully, data refreshed')
    } catch (err) {
      console.error('Add address error:', err)
      alert('Failed to save address. Please check your network or try again.')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!userId) return
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      const res = await fetch(`/api/addresses?id=${id}&userId=${encodeURIComponent(userId)}`, { 
        method: 'DELETE' 
      })
      const data = await res.json()
      
      if (!res.ok) {
        alert(data.error || 'Failed to delete address')
        return
      }
      
      mutate()
    } catch (err) {
      console.error('Delete address error:', err)
      alert('Failed to delete address. Please try again.')
    }
  }

  const handleEdit = (addr: any) => {
    setEditing(addr)
    setForm({ 
      address: addr.address, 
      city: addr.city, 
      pincode: addr.pincode, 
      primary: !!addr.primary 
    })
    setShowForm(true)
  }

  const handleEditSave = async (e: any) => {
    e.preventDefault()
    if (!userId || !editing) return
    setSubmitting(true)
    
    try {
      const res = await fetch('/api/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing._id, userId, ...form }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        alert(data.error || 'Failed to update address')
        setSubmitting(false)
        return
      }
      
      // Reset and close
      setEditing(null)
      setForm({ address: '', city: '', pincode: '', primary: false })
      setShowForm(false)
      mutate()
    } catch (err) {
      console.error('Edit address error:', err)
      alert('Failed to update address. Please try again.')
    }
    setSubmitting(false)
  }

  const handleSetPrimary = async (id: string) => {
    if (!userId) return
    
    try {
      const res = await fetch('/api/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId }),
      })
      const data = await res.json()
      
      if (!res.ok) {
        alert(data.error || 'Failed to set primary address')
        return
      }
      
      mutate()
    } catch (err) {
      console.error('Set primary error:', err)
      alert('Failed to set primary address. Please try again.')
    }
  }

  const resetForm = () => {
    setEditing(null)
    setShowForm(false)
    setForm({ address: '', city: '', pincode: '', primary: false })
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-pink-50 rounded-2xl p-6 shadow-lg animate-fadein">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 tracking-wide flex items-center gap-2">
          <MapPin className="w-6 h-6 text-blue-500" /> Saved Addresses
        </h3>
        <button 
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-full text-base font-semibold shadow transition-all duration-200"
          onClick={() => { 
            setShowForm(true)
            setEditing(null)
            setForm({ address: '', city: '', pincode: '', primary: false }) 
          }}
        >
          + Add New Address
        </button>
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {addresses.length > 0 ? (
          addresses.map((addr: any) => (
            <div 
              key={addr._id} 
              className={`border rounded-2xl p-5 flex flex-col gap-3 shadow-md bg-white/80 hover:shadow-xl transition-all duration-300 animate-fadein ${
                addr.primary ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-base text-gray-900">{addr.address}</span>
                  </div>
                  <span className="text-sm text-gray-600">{addr.city} - {addr.pincode}</span>
                </div>
                {addr.primary && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
                    <Star className="w-3 h-3 mr-1 text-yellow-300" /> Primary
                  </span>
                )}
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <button 
                  className="bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold shadow hover:bg-blue-800 transition-colors" 
                  disabled
                >
                  Deliver Here
                </button>
                {!addr.primary && (
                  <button 
                    onClick={() => handleSetPrimary(addr._id)} 
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Set Primary
                  </button>
                )}
                <button 
                  onClick={() => handleEdit(addr)} 
                  className="text-xs text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(addr._id)} 
                  className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 italic col-span-full text-center py-8">
            No saved addresses yet. Add your shipping address for future orders.
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-8" />

      {/* Add/Edit Form */}
      {showForm && (
        <form 
          onSubmit={editing ? handleEditSave : handleAdd} 
          className="mb-4 space-y-4 bg-white/90 p-6 rounded-2xl shadow-lg max-w-lg border border-gray-200 mx-auto animate-fadein"
        >
          <h4 className="font-semibold text-xl text-gray-900 mb-2">
            {editing ? 'Edit Address' : 'Add New Address'}
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <input 
              value={form.address} 
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))} 
              placeholder="Street address, apartment, suite, etc." 
              className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input 
              value={form.city} 
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))} 
              placeholder="City" 
              className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode *
            </label>
            <input 
              value={form.pincode} 
              onChange={e => setForm(f => ({ ...f, pincode: e.target.value }))} 
              placeholder="Pincode" 
              className="border rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
              required 
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={form.primary} 
              onChange={e => setForm(f => ({ ...f, primary: e.target.checked }))}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="text-sm text-gray-700">Set as Primary Address</span>
          </label>
          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={submitting} 
              className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-full font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting ? 'Saving...' : (editing ? 'Save Changes' : 'Save Address')}
            </button>
            <button 
              type="button" 
              onClick={resetForm} 
              className="text-sm text-gray-600 px-4 py-2 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <style jsx global>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fadein {
          animation: fadein 0.5s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  )
}