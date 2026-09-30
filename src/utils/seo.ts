export const SITE_URL = 'https://steamfolio-mvtos.vercel.app'

export const DEFAULT_TITLE = 'SteamFolio | Dashboard de profil Steam par Mathis Aguado'
export const DEFAULT_DESCRIPTION =
  "Dashboard personnel branché sur l'API Steam : profil, bibliothèque de jeux, temps de jeu, succès débloqués et liste d'amis, en un coup d'œil."

export interface PageSeo {
  title?: string
  description?: string
  path: string
}

/** Sets `content` on `<meta {attr}="{key}">`, creating the tag if absent. */
export function setMetaTag(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Sets `href` on `<link rel="{rel}">`, creating the tag if absent. */
export function setLinkTag(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    document.head.appendChild(el)
  }
  el.href = href
}

export function applyPageSeo({ title, description, path }: PageSeo): void {
  const pageTitle = title ?? DEFAULT_TITLE
  const pageDescription = description ?? DEFAULT_DESCRIPTION
  const url = `${SITE_URL}${path}`

  document.title = pageTitle
  setMetaTag('name', 'description', pageDescription)
  setMetaTag('property', 'og:title', pageTitle)
  setMetaTag('property', 'og:description', pageDescription)
  setMetaTag('property', 'og:url', url)
  setMetaTag('name', 'twitter:title', pageTitle)
  setMetaTag('name', 'twitter:description', pageDescription)
  setLinkTag('canonical', url)
}
