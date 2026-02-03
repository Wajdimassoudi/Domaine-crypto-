
export default async function handler(req, res) {
  const { endpoint, q, category_id, asin, page = "1" } = req.query;
  
  // 🔒 SECURE: API Key from RapidAPI
  const RAPID_API_KEY = process.env.RAPIDAPI_KEY || '02610beb8bmshcf2b3fee4e51754p18dc93jsnbe07890a0e3a';
  const RAPID_API_HOST = 'real-time-amazon-data.p.rapidapi.com';

  let url = `https://${RAPID_API_HOST}/${endpoint}?country=US`;
  
  if (endpoint === 'search') url += `&query=${q}&page=${page}`;
  if (endpoint === 'products-by-category') url += `&category_id=${category_id}&page=${page}`;
  if (endpoint === 'product-details') url += `&asin=${asin}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
        return res.status(response.status).json(data);
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from Amazon API' });
  }
}
