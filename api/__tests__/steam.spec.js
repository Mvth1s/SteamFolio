import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../steam.js'

function createMockRes() {
  return {
    body: undefined,
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    },
  }
}

describe('steam api proxy', () => {
  beforeEach(() => {
    process.env.STEAM_API_KEY = 'test-key'
  })

  it('accepts malformed amp-prefixed endpoint query key', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const req = {
      method: 'GET',
      query: {
        steamid: '76561198316121302',
        'amp;steamEndpoint': 'ISteamUser/GetPlayerSummaries/v2/',
      },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [calledUrl] = fetchMock.mock.calls[0]
    expect(calledUrl).toContain('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?')
    expect(calledUrl).toContain('steamid=76561198316121302')
  })

  it('accepts repeatedly encoded amp-prefixed endpoint query key', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const req = {
      method: 'GET',
      query: {
        steamid: '76561198316121302',
        'amp;amp;steamEndpoint': 'ISteamUser/GetPlayerSummaries/v2/',
      },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ ok: true })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [calledUrl] = fetchMock.mock.calls[0]
    expect(calledUrl).toContain('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?')
    expect(calledUrl).toContain('steamid=76561198316121302')
  })

  it('keeps canonical query key when both canonical and malformed keys exist', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const req = {
      method: 'GET',
      query: {
        steamid: '76561198316121302',
        'amp;steamEndpoint': 'IPlayerService/GetOwnedGames/v1/',
        steamEndpoint: 'ISteamUser/GetPlayerSummaries/v2/',
      },
    }
    const res = createMockRes()

    await handler(req, res)

    const [calledUrl] = fetchMock.mock.calls[0]
    expect(calledUrl).toContain('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?')
  })

  it('falls back to steamEndpoint parsed from raw url query when req.query is malformed', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const req = {
      method: 'GET',
      url: '/api/steam?steamid=76561198316121302&amp;steamEndpoint=ISteamUser/GetPlayerSummaries/v2/',
      query: {
        steamid: '76561198316121302',
      },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    const [calledUrl] = fetchMock.mock.calls[0]
    expect(calledUrl).toContain('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?')
    expect(calledUrl).toContain('steamid=76561198316121302')
  })

  it('falls back to repeatedly encoded steamEndpoint in raw url query', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const req = {
      method: 'GET',
      url: '/api/steam?steamid=76561198316121302&amp;amp;steamEndpoint=ISteamUser/GetPlayerSummaries/v2/',
      query: {
        steamid: '76561198316121302',
      },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    const [calledUrl] = fetchMock.mock.calls[0]
    expect(calledUrl).toContain('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2?')
  })

  it('keeps existing 400 behavior when endpoint is missing', async () => {
    const req = {
      method: 'GET',
      query: {
        steamid: '76561198316121302',
      },
    }
    const res = createMockRes()

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(res.body).toEqual({ error: 'Missing steamEndpoint query parameter' })
  })
})
