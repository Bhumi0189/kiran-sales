// ReviewsTab: Shows purchased products, allows review submission
import useSWR from 'swr'
import { useEffect } from 'react'
import { useState } from 'react'
import { ToastProvider, ToastViewport, Toast } from "../ui/toast";

export default function ReviewsTab({ userId }: { userId: string }) {
  // Ensure the API call fetches only delivered products
  const { data, error, isLoading, mutate } = useSWR(`/api/orders?userId=${userId}&status=delivered`)
  const [review, setReview] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<{ productId: string, orderId: string, userName: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [userReviews, setUserReviews] = useState<any[]>([])
  const [showThankYouMessage, setShowThankYouMessage] = useState(false)

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

  const handleSubmitReview = async () => {
    try {
      // Submit review logic
      const newReview = await handleSubmit();
      Toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review has been successfully submitted.",
      });
      // Update the reviews list to show the new review to the customer
      setUserReviews((prevReviews) => [...prevReviews, newReview]);
    } catch (error) {
      console.error("Failed to submit review:", error);
      Toast({
        title: "Submission Failed",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  }

  // Filter delivered orders explicitly
  const deliveredOrders = data?.filter(
    (order: any) =>
      (order.status === 'delivered' || order.deliveryStatus === 'delivered') &&
      order.items?.length > 0
  ) || [];

  if (deliveredOrders.length === 0) {
    return <div className="text-gray-500 text-center py-8">No delivered products to review yet.</div>;
  }

  return (
    <ToastProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {deliveredOrders.map((order: any) =>
          order.items.map((item: any, idx: number) => {
            const userName = (order.userName || order.customerName || "").trim();
            const alreadyReviewed = userReviews.some(
              (r) => r.productId === item.productId && r.orderId === (order._id || order.id)
            );
            return (
              <div
                key={item.productId || item.id || idx}
                className="flex flex-col h-full shadow-md rounded-xl overflow-hidden border border-gray-200 bg-white"
              >
                <div className="flex flex-col h-full p-5">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-28 h-28 flex items-center justify-center bg-gray-100 rounded-lg border mb-2 overflow-hidden">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-full h-full object-contain bg-white border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.endsWith('/placeholder.jpg')) {
                            target.src = '/placeholder.jpg';
                          }
                        }}
                      />
                    </div>
                    <div className="font-semibold text-gray-900 text-lg text-center line-clamp-2 min-h-[2.5rem]">
                      {item.name}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 mb-2 text-center">
                    <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                    <div className="text-sm text-gray-600">Price: ₹{item.price}</div>
                    <div className="text-xs text-gray-400">Order #{order._id?.slice(-8)}</div>
                  </div>
                  <div className="flex-1 flex items-end justify-center mt-2">
                    <button
                      onClick={() => setSelectedProduct({ productId: item.productId, orderId: order._id || order.id, userName })}
                      className={`bg-blue-600 text-white py-2 px-4 rounded ${alreadyReviewed ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={alreadyReviewed}
                    >
                      {alreadyReviewed ? 'Review Submitted' : 'Add Review'}
                    </button>
                  </div>
                  {selectedProduct && selectedProduct.productId === item.productId && selectedProduct.orderId === (order._id || order.id) && !alreadyReviewed && (
                    <form onSubmit={e => { e.preventDefault(); handleSubmitReview(); }} className="mt-2">
                      <label className="block text-xs mb-1">Rating:</label>
                      <select value={rating} onChange={e => setRating(Number(e.target.value))} className="mb-1 border rounded p-1">
                        {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
                      </select>
                      <textarea value={review} onChange={e => setReview(e.target.value)} className="w-full border rounded p-1" required />
                      <button type="submit" disabled={submitting} className="mt-1 px-2 py-1 bg-blue-700 text-white rounded">Submit</button>
                    </form>
                  )}
                </div>
              </div>
            );
          })
        )}
        {showThankYouMessage && (
          <Toast>
            <Toast.Title>Review Submitted</Toast.Title>
            <Toast.Description>Thank you for your feedback! Your review has been successfully submitted.</Toast.Description>
          </Toast>
        )}
      </div>
      <ToastViewport />
    </ToastProvider>
  )
}
