// ReviewsTab: Shows purchased products, allows review submission
import useSWR from 'swr'
import { useEffect } from 'react'
import { useState } from 'react'

export default function ReviewsTab({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useSWR(`/api/orders?userId=${userId}&status=delivered`)
  const [review, setReview] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<{ productId: string, orderId: string, userName: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [userReviews, setUserReviews] = useState<any[]>([])

  // Fetch all reviews by this user
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/reviews?userId=${userId}`)
      .then(res => res.json())
      .then(data => setUserReviews(Array.isArray(data) ? data : []))
      .catch(() => setUserReviews([]));
  }, [userId, selectedProduct]);

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading reviews.</div>
  if (!data || data.length === 0) return <div>No delivered products to review.</div>

  const handleSubmit = async () => {
    if (!selectedProduct) return;
    setSubmitting(true)
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        productId: selectedProduct.productId,
        orderId: selectedProduct.orderId,
        userName: selectedProduct.userName,
        rating,
        review
      }),
    })
    // Notify admin section to refresh reviews
    await fetch('/api/admin/refresh-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: selectedProduct.orderId }),
    });
    setReview('')
    setSelectedProduct(null)
    setRating(5)
    setSubmitting(false)
    mutate()
  }

  return (
    <ul className="space-y-2">
      {data.map((order: any) => order.items.map((item: any) => {
        const userName = (order.userName || order.customerName || "").trim();
        const alreadyReviewed = userReviews.some(
          (r) => r.productId === item.productId && r.orderId === (order._id || order.id)
        );
        return (
          <li key={item.productId} className="border rounded p-2">
            <div>{item.productName || item.name}</div>
            <button
              onClick={() => setSelectedProduct({ productId: item.productId, orderId: order._id || order.id, userName })}
              className={`text-xs underline ${alreadyReviewed ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600'}`}
              disabled={alreadyReviewed}
            >
              {alreadyReviewed ? 'Review Submitted' : 'Add Review'}
            </button>
            {selectedProduct && selectedProduct.productId === item.productId && selectedProduct.orderId === (order._id || order.id) && !alreadyReviewed && (
              <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="mt-2">
                <label className="block text-xs mb-1">Rating:</label>
                <select value={rating} onChange={e => setRating(Number(e.target.value))} className="mb-1 border rounded p-1">
                  {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                </select>
                <textarea value={review} onChange={e => setReview(e.target.value)} className="w-full border rounded p-1" required />
                <button type="submit" disabled={submitting} className="mt-1 px-2 py-1 bg-blue-700 text-white rounded">Submit</button>
              </form>
            )}
          </li>
        );
      }))}
    </ul>
  )
}
