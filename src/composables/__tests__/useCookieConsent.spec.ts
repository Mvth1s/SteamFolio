import { beforeEach, describe, expect, it, vi } from 'vitest'

const GA_SCRIPT = 'script[src*="googletagmanager.com/gtag/js"]'

// The composable keeps module-level state, so each test gets a fresh copy
async function loadModule() {
  vi.resetModules()
  return import('@/composables/useCookieConsent')
}

describe('useCookieConsent', () => {
  beforeEach(() => {
    localStorage.clear()
    document.head.replaceChildren()
    document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    window.dataLayer = []
  })

  it('opens the banner and does not load GA when no choice is stored', async () => {
    const { initAnalytics, useCookieConsent } = await loadModule()
    initAnalytics()
    const { choice, bannerOpen } = useCookieConsent()
    expect(choice.value).toBeNull()
    expect(bannerOpen.value).toBe(true)
    expect(document.querySelector(GA_SCRIPT)).toBeNull()
  })

  it('loads GA and stores the choice on accept', async () => {
    const { useCookieConsent } = await loadModule()
    const { accept, choice, bannerOpen } = useCookieConsent()
    accept()
    expect(choice.value).toBe('granted')
    expect(bannerOpen.value).toBe(false)
    expect(document.querySelector(GA_SCRIPT)).not.toBeNull()
    expect(JSON.parse(localStorage.getItem('sf-consent')!).choice).toBe('granted')
  })

  it('loads GA at startup when consent was already granted', async () => {
    localStorage.setItem('sf-consent', JSON.stringify({ choice: 'granted', at: Date.now() }))
    const { initAnalytics, useCookieConsent } = await loadModule()
    initAnalytics()
    expect(useCookieConsent().bannerOpen.value).toBe(false)
    expect(document.querySelector(GA_SCRIPT)).not.toBeNull()
  })

  it('asks again when the stored choice is older than 6 months', async () => {
    const sevenMonthsAgo = Date.now() - 213 * 24 * 60 * 60 * 1000
    localStorage.setItem('sf-consent', JSON.stringify({ choice: 'granted', at: sevenMonthsAgo }))
    const { initAnalytics, useCookieConsent } = await loadModule()
    initAnalytics()
    expect(useCookieConsent().bannerOpen.value).toBe(true)
    expect(document.querySelector(GA_SCRIPT)).toBeNull()
  })

  it('ignores a malformed stored value', async () => {
    localStorage.setItem('sf-consent', 'not json')
    const { useCookieConsent } = await loadModule()
    expect(useCookieConsent().choice.value).toBeNull()
  })

  it('denies consent and clears GA cookies on refuse', async () => {
    const { useCookieConsent } = await loadModule()
    const { accept, refuse, choice } = useCookieConsent()
    accept()
    document.cookie = '_ga=GA1.1.123; path=/'
    refuse()
    expect(choice.value).toBe('denied')
    expect(document.cookie).not.toContain('_ga=')
    const last = window.dataLayer[window.dataLayer.length - 1] as IArguments
    expect(Array.from(last)).toEqual(['consent', 'update', { analytics_storage: 'denied' }])
  })
})
