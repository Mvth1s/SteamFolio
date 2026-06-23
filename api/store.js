const STORE_API_URL = 'https://store.steampowered.com/api/appdetails'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { appids, filters, l } = req.query
  if (!appids) {
    return res.status(400).json({ error: 'Missing appids query parameter' })
  }

  // Build URL manually — URLSearchParams would encode commas to %2C but Steam
  // uses literal commas as separators in both appids and filters values.
  const rawAppids = Array.isArray(appids) ? appids[0] : appids
  const rawFilters = Array.isArray(filters) ? filters[0] : filters
  const rawL = Array.isArray(l) ? l[0] : l
  const parts = [`appids=${rawAppids}`]
  if (rawFilters) parts.push(`filters=${rawFilters}`)
  if (rawL) parts.push(`l=${rawL}`)
  const targetUrl = `${STORE_API_URL}?${parts.join('&')}`

  try {
    const response = await fetch(targetUrl)
    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Store API proxy error:', error)
    return res.status(502).json({ error: 'Failed to reach Steam Store API' })
  }
}
