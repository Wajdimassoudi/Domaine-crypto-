export default async function handler(req, res) {
  // Logic to handle requests from the frontend
  // Frontend sends: /api/dynadot?command=search&keyword=...
  
  // 1. Extract Query Parameters properly
  const { path, ...restQuery } = req.query || {};

  // If parameters were passed as part of the path array (due to rewrite), use them
  let params = new URLSearchParams(restQuery);

  // 2. API Key
  const API_KEY = process.env.DYNADOT_API_KEY || '9H6k618s8Z8p6k8P8aN8T9F6t7Z7t6W717K6M7x8eP717T';
  
  const url = `https://api.dynadot.com/api3.xml?key=${API_KEY}&${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    
    // Pass the XML back to the frontend
    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(data);
  } catch (error) {
    console.error("Dynadot Proxy Error:", error);
    res.status(500).json({ error: 'Failed to fetch from Dynadot' });
  }
}