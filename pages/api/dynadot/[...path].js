// Next.js API Route for Dynadot Proxy
// This runs on the server side, keeping the API Key secure.

export default async function handler(req, res) {
  const { path } = req.query;
  // Join path segments and merge with existing query params
  // Example: /api/dynadot/command=CheckDomain&domain=test.com
  
  // Construct the command string from the path array (if passed as path) or query
  // For flexibility, we assume the client passes the full command query string as the path or query params
  // But strictly following user snippet:
  
  const queryString = Object.keys(req.query)
    .filter(key => key !== 'path')
    .map(key => `${key}=${req.query[key]}`)
    .join('&');

  const pathString = Array.isArray(path) ? path.join('&') : path;

  // Combine path commands and query params
  const fullCommand = [pathString, queryString].filter(Boolean).join('&');

  const url = `https://api.dynadot.com/api3.xml?key=9H6k618s8Z8p6k8P8aN8T9F6t7Z7t6W717K6M7x8eP717T&${fullCommand}`;
  
  try {
      const response = await fetch(url);
      const data = await response.text();
      res.setHeader('Content-Type', 'application/xml');
      res.status(200).send(data);
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch from Dynadot' });
  }
}