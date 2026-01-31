export default async function handler(req, res) {
  // 🔒 SECURE: API Key is stored on the server side (Backend).
  // It checks for Environment Variable first, falls back to the provided key.
  const API_KEY = process.env.PRINTFUL_API_KEY || 'woxlP3EjQiUbVoZYGkrThu4i3LxMXBJx2wWnmP7V';
  
  const { method, body } = req;
  const { path, ...queryParams } = req.query || {};

  // Construct URL
  // Supported actions: 'products' (GET), 'orders' (POST)
  let endpoint = '';
  
  if (req.method === 'GET') {
      // Get Sync Products from store
      endpoint = 'store/products'; 
  } else if (req.method === 'POST') {
      // Create Order
      endpoint = 'orders';
  }

  const url = `https://api.printful.com/${endpoint}`;

  try {
    const options = {
        method: method,
        headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
        }
    };

    if (method === 'POST' && body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        console.error('Printful API Error:', data);
        return res.status(response.status).json(data);
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Printful Proxy Error:", error);
    res.status(500).json({ error: 'Failed to connect to Printful' });
  }
}