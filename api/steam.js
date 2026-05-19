const STEAM_API_BASE_URL = 'https://api.steampowered.com'

function getFallbackEndpointFromRawUrl(req) {
  if (typeof req.url !== 'string' || !req.url.includes('?')) {
    return undefined
  }

  const [, rawSearch = ''] = req.url.split('?', 2)
  let decodedSearch = rawSearch
  while (decodedSearch.includes('&amp;')) {
    decodedSearch = decodedSearch.replaceAll('&amp;', '&')
  }
  const params = new URLSearchParams(decodedSearch)
  for (const [key, value] of params.entries()) {
    const normalizedKey = key.replace(/^(?:amp;)+/, '')
    if (normalizedKey === 'steamEndpoint' && value) {
      return value
    }
  }
  return undefined
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.STEAM_API_KEY ?? process.env.VITE_STEAM_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'STEAM_API_KEY or VITE_STEAM_API_KEY is not configured' })
  }

  // Some clients accidentally encode '&' into the next query key (`amp;steamEndpoint`).
  const normalizedQuery = {}
  for (const [key, value] of Object.entries(req.query)) {
    const normalizedKey = key.replace(/^(?:amp;)+/, '')
    const hasNormalizedKey = Object.prototype.hasOwnProperty.call(normalizedQuery, normalizedKey)
    const isMalformedKey = key !== normalizedKey

    if (isMalformedKey && hasNormalizedKey) {
      continue
    }
    normalizedQuery[normalizedKey] = value
  }

  const { steamEndpoint, ...rawParams } = normalizedQuery
  const endpointValue = Array.isArray(steamEndpoint) ? steamEndpoint[0] : steamEndpoint
  const fallbackEndpoint = getFallbackEndpointFromRawUrl(req)
  const resolvedEndpoint = endpointValue || fallbackEndpoint
  if (!resolvedEndpoint) {
    return res.status(400).json({ error: 'Missing steamEndpoint query parameter' })
  }

  const queryParams = new URLSearchParams({ key: apiKey, format: 'json' })
  for (const [paramKey, paramValue] of Object.entries(rawParams)) {
    const value = Array.isArray(paramValue) ? paramValue[0] : paramValue
    if (typeof value === 'string' && value.length > 0) {
      queryParams.set(paramKey, value)
    }
  }

  const normalizedEndpoint = resolvedEndpoint.replace(/\/+/g, '/').replace(/^\/|\/$/g, '')
  if (!/^[A-Za-z0-9/.]+$/.test(normalizedEndpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint query parameter' })
  }
  const targetUrl = `${STEAM_API_BASE_URL}/${normalizedEndpoint}?${queryParams.toString()}`

  try {
    const response = await fetch(targetUrl)
    const contentType = response.headers.get('content-type') ?? ''
    let data
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const nonJsonBody = await response.text()
      console.error('Steam API returned non-JSON response:', nonJsonBody)
      data = { error: 'Steam API returned non-JSON response' }
    }
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Steam API proxy error:', error)
    return res.status(502).json({ error: 'Failed to reach Steam API' })
  }
}
