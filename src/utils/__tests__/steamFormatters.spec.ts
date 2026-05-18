import { describe, expect, it } from 'vitest'
import { formatPlaytime, getStatusLabel, sortAndFilterGames } from '@/utils/steamFormatters'

describe('steamFormatters', () => {
  it('maps status labels and playtime correctly', () => {
    expect(getStatusLabel(1)).toBe('Online')
    expect(getStatusLabel(99)).toBe('Unknown')
    expect(formatPlaytime(90)).toBe('1.5 h')
  })

  it('filters and sorts game library results', () => {
    const games = [
      { appid: 1, name: 'Portal 2', playtime_forever: 120, img_icon_url: '' },
      { appid: 2, name: 'Half-Life', playtime_forever: 30, img_icon_url: '' },
      { appid: 3, name: 'Counter-Strike', playtime_forever: 500, img_icon_url: '' },
    ]

    const result = sortAndFilterGames(games, 'life', 'playtime-asc')

    expect(result.map((game) => game.name)).toEqual(['Half-Life'])
  })
})
