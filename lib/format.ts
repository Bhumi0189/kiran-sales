export function formatRupee(v: any) {
  const n = typeof v === 'number' ? v : Number(v ?? 0)
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString('en-IN')
}

export function formatNumber(v: any) {
  const n = typeof v === 'number' ? v : Number(v ?? 0)
  if (Number.isNaN(n)) return '0'
  return n.toLocaleString()
}
