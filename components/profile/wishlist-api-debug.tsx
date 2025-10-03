// Debug utility to test the wishlist API endpoint from the browser
import { useEffect, useState } from 'react'

export default function WishlistApiDebug({ email }: { email: string }) {
  const [response, setResponse] = useState<any>(null)
  useEffect(() => {
    fetch(`/api/wishlist?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(setResponse)
  }, [email])
  return (
    <pre style={{fontSize:'12px',color:'#c00',background:'#fffbe6',padding:'8px',border:'1px solid #eee',marginTop:'16px'}}>
      {JSON.stringify(response, null, 2)}
    </pre>
  )
}
