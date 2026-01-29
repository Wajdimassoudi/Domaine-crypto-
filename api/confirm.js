export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  
  const order = req.body
  console.log('🔔 New order:', order)
  
  res.status(200).json({ success: true, order_id: order?.id || 'unknown' })
}