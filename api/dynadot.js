
export default async function handler(req, res) {
  // Logic to handle both direct query params or path-like params from the frontend
  // Frontend sends: /api/dynadot/command=CheckDomain&domain=...
  // Vercel Rewrite sends this to /api/dynadot.js
  
  // Extract the "rest of the path" from the URL if needed, or just use query params
  // Since we use a rewrite in vercel.json, the full URL comes in.
  
  let queryParams = '';
  
  // Check if we have standard query params
  if (Object.keys(req.query).length > 0) {
      queryParams = new URLSearchParams(req.query).toString();
  } else {
      // Fallback: try to parse from the url if it was rewritten
      // In this specific app setup, the service calls /api/dynadot/params...
      // The rewrite rules map /api/dynadot/(.*) -> api/dynadot.js
      // The param string might be lost in req.query if not careful, 
      // but usually Vercel passes the wildcard as a query param named in the rewrite (we didn't name it).
      // However, typical Vercel functions work best with standard query params.
      
      // Let's assume the frontend sends standard params for safety OR the rewrite works.
      // To be safe, we simply check req.url
      const urlParts = req.url.split('/api/dynadot/');
      if (urlParts.length > 1) {
          queryParams = urlParts[1];
      }
  }

  // API Key - Replace with process.env.DYNADOT_API_KEY in production
  const API_KEY = process.env.DYNADOT_API_KEY || '9H6k618s8Z8p6k8P8aN8T9F6t7Z7t6W717K6M7x8eP717T';
  
  const url = `https://api.dynadot.com/api3.xml?key=${API_KEY}&${queryParams}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Dynadot' });
  }
}