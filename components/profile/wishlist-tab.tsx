// WishlistTab: Shows user's wishlist items
import useSWR from 'swr'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'


export default function WishlistTab({ email }: { email: string }) {
  if (!email) {
    return <div className="text-red-600">No user email provided.</div>;
  }
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data, error, isLoading, mutate } = useSWR(
    `/api/wishlist?email=${encodeURIComponent(email)}`,
    fetcher,
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  );
  if (isLoading) return <div>Loading wishlist...</div>;
  if (error) return <div>Error loading wishlist.</div>;
  // Debug: show raw data
  if (!data) {
    return <div>No wishlist data received.<pre style={{fontSize:'10px',color:'#888',overflow:'auto'}}>{JSON.stringify(data, null, 2)}</pre></div>;
  }
  // Only use data.items as the source of wishlist items
  if (!data || !('items' in data)) {
    return <div>Loading wishlist items...</div>;
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    return <div>No wishlist items.</div>;
  }
  const items = data.items;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item: any) => (
        <div key={item.id || item._id} className="border rounded-xl shadow-md p-5 flex flex-col bg-white hover:shadow-lg transition-shadow">
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className="w-full h-40 object-cover rounded mb-3 border"
          />
          <div className="flex flex-col gap-1 mb-2">
            <div className="font-bold text-lg text-gray-800">{item.name}</div>
            <div className="text-gray-500 text-sm">{item.category}</div>
            {item.subcategory && <div className="text-gray-400 text-xs">{item.subcategory}</div>}
          </div>
          <div className="text-gray-700 text-sm mb-2 line-clamp-2">{item.description}</div>
          {item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 && (
            <div className="text-xs text-gray-500 mb-1">Size: {item.sizes.join(', ')}</div>
          )}
          <div className="flex items-center gap-2 mt-auto mb-2">
            <div className="font-bold text-blue-600 text-xl">₹{item.price}</div>
            {item.originalPrice && item.originalPrice > item.price && (
              <div className="line-through text-gray-400 text-base">₹{item.originalPrice}</div>
            )}
          </div>
          <div className="text-xs text-gray-400 mb-3">Stock: {item.stock}</div>
          <button
            className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
            // onClick={() => handleMoveToCart(item)}
            disabled={item.stock === 0}
            title={item.stock === 0 ? 'Out of stock' : 'Move to Cart'}
          >
            {item.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
          </button>
          <button
            className="mt-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors p-2 flex items-center justify-center"
            onClick={async () => {
              try {
                const res = await fetch('/api/wishlist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: email,
                    product: {
                      id: item._id || item.id,
                    },
                    action: 'remove',
                  }),
                });
                if (res.ok) {
                  // Revalidate the wishlist data
                  mutate();
                } else {
                  alert('Failed to remove item from wishlist.');
                }
              } catch (error) {
                alert('Failed to remove item from wishlist.');
              }
            }}
            title="Remove from Wishlist"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
