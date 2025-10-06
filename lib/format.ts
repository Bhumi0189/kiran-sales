export function formatRupee(amount: any) {
  const n = typeof amount === 'number' ? amount : Number(amount ?? 0);
  if (Number.isNaN(n)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatNumber(v: any) {
  const n = typeof v === 'number' ? v : Number(v ?? 0)
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString()
}
