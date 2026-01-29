
export default async function handler(req, res) {
  // Logic to handle requests from the frontend
  // Frontend sends: /api/dynadot?command=search&keyword=...
  
  // 1. Extract Query Parameters
  // In Vercel, req.query contains the parsed query string.
  const queryObj = req.query || {};
  
  // Remove any Vercel-specific routing params if they exist (sometimes 'path' is added via rewrites)
  delete queryObj.path; 

  const queryParams = new URLSearchParams(queryObj).toString();

  // 2. API Key - Use Environment Variable or Fallback
  // IMPORTANT: You must add DYNADOT_API_KEY to Vercel Environment Variables
  const API_KEY = process.env.DYNADOT_API_KEY || '9H6k618s8Z8p6k8P8aN8T9F6t7Z7t6W717K6M7x8eP717T';
  
  const url = `https://api.dynadot.com/api3.xml?key=${API_KEY}&${queryParams}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    
    // Pass the XML back to the frontend
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS if needed
    res.status(200).send(data);
  } catch (error) {
    console.error("Dynadot Proxy Error:", error);
    res.status(500).json({ error: 'Failed to fetch from Dynadot' });
  }
}