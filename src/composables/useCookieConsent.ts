import { ref, readonly } from 'vue'

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

export type ConsentChoice = 'granted' | 'denied'

const GA_ID = 'G-Y2LTNR239S'
const STORAGE_KEY = 'sf-consent'
// CNIL recommends asking again after 6 months
const CONSENT_MAX_AGE_MS = 183 * 24 * 60 * 60 * 1000

function readStoredChoice(): ConsentChoice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { choice, at } = JSON.parse(raw)
    if (choice !== 'granted' && choice !== 'denied') return null
    if (typeof at !== 'number' || Date.now() - at > CONSENT_MAX_AGE_MS) return null
    return choice
  } catch {
    return null
  }
}

function storeChoice(choice: ConsentChoice) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice, at: Date.now() }))
  } catch { /* storage unavailable: banner will show again next visit */ }
}

const choice = ref<ConsentChoice | null>(readStoredChoice())
const bannerOpen = ref(choice.value === null)
let gaLoaded = false

// gtag.js only understands the `arguments` object, not a plain array
function gtag(..._args: unknown[]) {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments)
}

function loadAnalytics() {
  if (gaLoaded) {
    gtag('consent', 'update', { analytics_storage: 'granted' })
    return
  }
  gaLoaded = true
  window.dataLayer = window.dataLayer || []
  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  gtag('js', new Date())
  gtag('config', GA_ID)

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)
}

function clearAnalyticsCookies() {
  const host = location.hostname
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim()
    if (!name || !name.startsWith('_ga')) continue
    for (const domain of ['', `; domain=${host}`, `; domain=.${host}`]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain}`
    }
  }
}

/** Call once at startup: loads Google Analytics if the visitor already accepted. */
export function initAnalytics() {
  if (choice.value === 'granted') loadAnalytics()
}

export function useCookieConsent() {
  function accept() {
    choice.value = 'granted'
    storeChoice('granted')
    bannerOpen.value = false
    loadAnalytics()
  }

  function refuse() {
    choice.value = 'denied'
    storeChoice('denied')
    bannerOpen.value = false
    if (gaLoaded) gtag('consent', 'update', { analytics_storage: 'denied' })
    clearAnalyticsCookies()
  }

  function openBanner() {
    bannerOpen.value = true
  }

  return { choice: readonly(choice), bannerOpen: readonly(bannerOpen), accept, refuse, openBanner }
}
