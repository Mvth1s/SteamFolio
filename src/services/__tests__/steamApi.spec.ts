import { describe, expect, it, vi } from 'vitest'
import {
  getFriends,
  getFriendsSummary,
  getOwnedGames,
  getPlayerAchievements,
  getPlayerSummary,
  getSteamLevel,
} from '../steamApi'

function mockFetch(body: unknown, status = 200) {
  const mock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  )
  vi.stubGlobal('fetch', mock)
  return mock
}

describe('getPlayerSummary', () => {
  it('returns the first player from the response', async () => {
    const player = { steamid: '123', personaname: 'Mvth1s', avatarfull: 'http://img', personastate: 1, profileurl: '' }
    const mock = mockFetch({ response: { players: [player] } })

    const result = await getPlayerSummary()

    expect(result).toEqual(player)
    const url = mock.mock.calls[0]![0] as string
    expect(url).toContain('steamids=')
    expect(url).toContain('GetPlayerSummaries')
  })

  it('returns null when the players array is empty', async () => {
    mockFetch({ response: { players: [] } })
    expect(await getPlayerSummary()).toBeNull()
  })
})

describe('getSteamLevel', () => {
  it('returns the player level', async () => {
    mockFetch({ response: { player_level: 42 } })
    expect(await getSteamLevel()).toBe(42)
  })

  it('returns null when player_level is absent', async () => {
    mockFetch({ response: {} })
    expect(await getSteamLevel()).toBeNull()
  })
})

describe('getOwnedGames', () => {
  it('returns the games array', async () => {
    const games = [{ appid: 730, name: 'CS2', playtime_forever: 120 }]
    mockFetch({ response: { games } })
    expect(await getOwnedGames()).toEqual(games)
  })

  it('returns an empty array when games is absent', async () => {
    mockFetch({ response: {} })
    expect(await getOwnedGames()).toEqual([])
  })
})

describe('getFriends', () => {
  it('returns the friends array', async () => {
    const friends = [{ steamid: '999', relationship: 'friend', friend_since: 0 }]
    mockFetch({ friendslist: { friends } })
    expect(await getFriends()).toEqual(friends)
  })

  it('returns an empty array when friendslist is absent', async () => {
    mockFetch({})
    expect(await getFriends()).toEqual([])
  })
})

describe('getFriendsSummary', () => {
  it('returns an empty array for an empty input without fetching', async () => {
    const mock = mockFetch({})
    expect(await getFriendsSummary([])).toEqual([])
    expect(mock).not.toHaveBeenCalled()
  })

  it('fetches a single batch when ≤ 100 ids', async () => {
    const players = [{ steamid: '1', personaname: 'A', avatarfull: '', personastate: 0, profileurl: '' }]
    const mock = mockFetch({ response: { players } })

    const result = await getFriendsSummary(['1', '2', '3'])

    expect(result).toEqual(players)
    expect(mock).toHaveBeenCalledTimes(1)
    const url = mock.mock.calls[0]![0] as string
    expect(url).toContain('steamids=')
  })

  it('splits into multiple batches when > 100 ids', async () => {
    const ids = Array.from({ length: 150 }, (_, i) => String(i))
    const players = ids.map((id) => ({ steamid: id, personaname: id, avatarfull: '', personastate: 0, profileurl: '' }))

    const mock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ response: { players: players.slice(0, 100) } }), { status: 200, headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ response: { players: players.slice(100) } }), { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', mock)

    const result = await getFriendsSummary(ids)

    expect(mock).toHaveBeenCalledTimes(2)
    expect(result).toHaveLength(150)
  })
})

describe('getPlayerAchievements', () => {
  it('returns the achievements array', async () => {
    const achievements = [{ apiname: 'ACH_1', achieved: 1 as const, unlocktime: 0 }]
    mockFetch({ playerstats: { achievements } })
    expect(await getPlayerAchievements(730)).toEqual(achievements)
  })

  it('returns an empty array on HTTP 400 (game has no achievement stats)', async () => {
    mockFetch({ playerstats: { error: 'Requested app has no stats' } }, 400)
    expect(await getPlayerAchievements(730)).toEqual([])
  })

  it('throws on other HTTP errors', async () => {
    mockFetch({ error: 'Forbidden' }, 403)
    await expect(getPlayerAchievements(730)).rejects.toThrow('403')
  })

  it('passes appid and language in the request', async () => {
    const mock = mockFetch({ playerstats: { achievements: [] } })
    await getPlayerAchievements(440)
    const url = mock.mock.calls[0]![0] as string
    expect(url).toContain('appid=440')
    expect(url).toContain('l=english')
  })
})
