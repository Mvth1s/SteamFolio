const STEAM_API_BASE_URL = 'https://api.steampowered.com'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.VITE_STEAM_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'VITE_STEAM_API_KEY is not configured' })
  }

  const { endpoint, ...rawParams } = req.query
  const endpointValue = Array.isArray(endpoint) ? endpoint[0] : endpoint
  if (!endpointValue) {
    return res.status(400).json({ error: 'Missing endpoint query parameter' })
  }

  const queryParams = new URLSearchParams({ key: apiKey, format: 'json' })
  for (const [paramKey, paramValue] of Object.entries(rawParams)) {
    const value = Array.isArray(paramValue) ? paramValue[0] : paramValue
    if (typeof value === 'string' && value.length > 0) {
      queryParams.set(paramKey, value)
    }
  }

  const normalizedEndpoint = endpointValue.startsWith('/') ? endpointValue.slice(1) : endpointValue
  const targetUrl = `${STEAM_API_BASE_URL}/${normalizedEndpoint}?${queryParams.toString()}`

  try {
    const response = await fetch(targetUrl)
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch {
    return res.status(502).json({ error: 'Failed to reach Steam API' })
  }
}
