import { ref, readonly } from 'vue'
import type { LangKey } from '@/types/design'

const SF_I18N: Record<LangKey, Record<string, string>> = {
  en: {
    // nav
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.library': 'Library',
    'nav.achievements': 'Achievements',
    'nav.friends': 'Friends',
    'nav.wishlist': 'Wishlist',
    'nav.reviews': 'Reviews',
    'nav.screenshots': 'Screenshots',
    'nav.menu': 'MENU',
    'nav.quick': 'QUICK',

    // crumbs
    'crumb.overview': 'OVERVIEW',
    'crumb.profile': 'PROFILE',
    'crumb.collection': 'COLLECTION',
    'crumb.trophies': 'TROPHIES',
    'crumb.social': 'SOCIAL',
    'crumb.wishlist': 'WISHLIST',
    'crumb.reviews': 'REVIEWS',
    'crumb.screenshots': 'SCREENSHOTS',

    // common
    'common.search': 'search games, friends, achievements…',
    'common.online': 'Online',
    'common.offline': 'Offline',
    'common.away': 'Away',
    'common.inGame': 'In-Game',
    'common.lvl': 'LVL',
    'common.synced': '◆ SYNCED 2 MIN AGO ◆',
    'common.beta': 'v0.4 · beta',
    'common.clear': 'clear',
    'common.add': 'ADD',
    'common.close': 'close',
    'common.searchHint': 'Search by game, genre, or studio',
    'common.noResults': 'No results',
    'common.keyboard': '↑↓ navigate · ↵ open · esc close',

    // dashboard
    'dash.overview': 'OVERVIEW',
    'dash.gamesOwned': 'GAMES OWNED',
    'dash.dlcOwned': 'DLCs OWNED',
    'dash.totalHours': 'TOTAL HOURS',
    'dash.weeklyAvg': 'WEEKLY AVG',
    'dash.genres': 'MOST PLAYED GENRE',
    'dash.weekly': 'AVG PLAYTIME · LAST 7 DAYS',
    'dash.dlcRatio': 'DLC / GAMES RATIO',
    'dash.achRate': 'ACHIEVEMENT RATE',
    'dash.featured': 'MOST PLAYED',
    'dash.currentlyPlaying': 'CURRENTLY PLAYING',
    'dash.lastPlayed': 'LAST PLAYED',
    'dash.live': 'LIVE',
    'dash.activity': 'RECENT ACTIVITY',
    'dash.top3': 'PERSONAL TOP 3',
    'dash.thisMonth': 'THIS MONTH',
    'dash.thisYear': 'THIS YEAR',
    'dash.allTime': 'ALL TIME',
    'dash.worldmap': 'FRIENDS WORLDWIDE',
    'dash.rarest': 'RAREST ACHIEVEMENT',
    'dash.thisWeek': 'this week',
    'dash.session': 'SESSION',
    'dash.completion': '% completion',
    'dash.nextMilestone': 'NEXT MILESTONE · 40%',
    'dash.toGo': 'to go',
    'dash.hrsTotal': 'hrs total',
    'dash.hrsPerDay': 'h/day avg',
    'dash.global': 'global completion',
    'dash.leader': 'Leader',
    'dash.rank': 'RANK',
    'dash.inLibrary': 'in library',
    'dash.lastSession': 'last session',

    // tooltips
    'tip.gamesOwned': 'All games on your Steam account, including free titles and gifts.',
    'tip.dlcOwned': 'Add-ons, expansions and content packs owned across your library.',
    'tip.totalHours': 'Lifetime playtime across every game Steam has tracked.',
    'tip.weeklyAvg': 'Total hours played in the last 7 days divided by 7.',
    'tip.achRate': 'Achievements unlocked divided by total available across all owned games.',
    'tip.dlcRatio': 'Average DLCs owned per base game across your library.',

    // profile
    'profile.member': 'Member since Sep 2014',
    'profile.showcase': 'SHOWCASE · TOP GAMES',
    'profile.badges': 'BADGES',
    'profile.badgesEarned': '12 earned',
    'profile.quickFacts': 'QUICK FACTS',
    'profile.country': 'Country',
    'profile.joined': 'Joined',
    'profile.avgSession': 'Avg session',
    'profile.bestWeek': 'Best week',
    'profile.genres': 'Genres played',
    'profile.reviews': 'Reviews written',
    'profile.workshop': 'Workshop items',

    // library
    'lib.byPlay': 'BY PLAYTIME',
    'lib.recent': 'RECENT',
    'lib.alpha': 'A → Z',
    'lib.placeholder': 'search your library…',
    'lib.noMatch': 'No games match',
    'lib.totalGames': 'games',
    'lib.totalHrs': 'total hours',

    // achievements
    'ach.unlocked': 'UNLOCKED',
    'ach.rare': 'RARE (< 5%)',
    'ach.perfect': 'PERFECT GAMES',
    'ach.globalRate': 'GLOBAL RATE',
    'ach.byGame': 'BY GAME',
    'ach.recentUnlocks': 'RECENT UNLOCKS',
    'ach.rarity': 'RARITY',
    'ach.unlockedSuffix': 'unlocked',

    // friends
    'friends.all': 'ALL',
    'friends.online': 'ONLINE',
    'friends.ingame': 'IN-GAME',
    'friends.offline': 'OFFLINE',
    'friends.addFriend': '+ ADD FRIEND',
    'friends.total': 'total',

    // search palette
    'search.title': 'Global Search',
    'search.placeholder': 'search games, genres, studios…',
    'search.recent': 'Recent',
    'search.suggestions': 'Try',

    // sound
    'sound.mute': 'Mute',
    'sound.unmute': 'Unmute',

    // theme
    'theme.label': 'Theme',

    // cache
    'cache.stale': 'Cached data may be more than 2 days old. Press Ctrl+F5 to force a refresh.',
    'cache.dismiss': 'dismiss',

    // errors
    'err.404.title': '404 · NOT FOUND',
    'err.404.body': 'This page is hiding behind a chest in another zone. Try the sidebar.',
    'err.403.title': '403 · LOCKED',
    'err.403.body': 'You need a key card for this area. Continue your quest elsewhere.',
    'err.500.title': '500 · CRITICAL HIT',
    'err.500.body': 'The server took 9999 damage. Respawn in a moment.',
    'err.api.title': 'STEAM API · QUOTA EXCEEDED',
    'err.api.body': 'Too many requests. Wait for the cooldown to expire (about 5 min).',
    'err.back': '← BACK TO BASE',
  },

  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.profile': 'Profil',
    'nav.library': 'Bibliothèque',
    'nav.achievements': 'Succès',
    'nav.friends': 'Amis',
    'nav.wishlist': 'Liste de souhaits',
    'nav.reviews': 'Évaluations',
    'nav.screenshots': 'Captures d\'écran',
    'nav.menu': 'MENU',
    'nav.quick': 'RAPIDE',

    'crumb.overview': "VUE D'ENSEMBLE",
    'crumb.profile': 'PROFIL',
    'crumb.collection': 'COLLECTION',
    'crumb.trophies': 'TROPHÉES',
    'crumb.social': 'SOCIAL',
    'crumb.wishlist': 'LISTE DE SOUHAITS',
    'crumb.reviews': 'ÉVALUATIONS',
    'crumb.screenshots': 'CAPTURES',

    'common.search': 'rechercher jeux, amis, succès…',
    'common.online': 'En ligne',
    'common.offline': 'Hors ligne',
    'common.away': 'Absent',
    'common.inGame': 'En jeu',
    'common.lvl': 'NIV',
    'common.synced': '◆ SYNC IL Y A 2 MIN ◆',
    'common.beta': 'v0.4 · bêta',
    'common.clear': 'effacer',
    'common.add': 'AJOUTER',
    'common.close': 'fermer',
    'common.searchHint': 'Rechercher par jeu, genre ou studio',
    'common.noResults': 'Aucun résultat',
    'common.keyboard': '↑↓ naviguer · ↵ ouvrir · esc fermer',

    'dash.overview': "VUE D'ENSEMBLE",
    'dash.gamesOwned': 'JEUX POSSÉDÉS',
    'dash.dlcOwned': 'DLC POSSÉDÉS',
    'dash.totalHours': 'HEURES TOTALES',
    'dash.weeklyAvg': 'MOYENNE HEBDO',
    'dash.genres': 'GENRE LE PLUS JOUÉ',
    'dash.weekly': 'TEMPS DE JEU · 7 DERNIERS JOURS',
    'dash.dlcRatio': 'RATIO DLC / JEUX',
    'dash.achRate': 'TAUX DE SUCCÈS',
    'dash.featured': 'PLUS JOUÉ',
    'dash.currentlyPlaying': 'EN COURS DE JEU',
    'dash.lastPlayed': 'DERNIER JEU',
    'dash.live': 'EN DIRECT',
    'dash.activity': 'ACTIVITÉ RÉCENTE',
    'dash.top3': 'TOP 3 PERSONNEL',
    'dash.thisMonth': 'CE MOIS',
    'dash.thisYear': 'CETTE ANNÉE',
    'dash.allTime': 'DEPUIS TOUJOURS',
    'dash.worldmap': 'AMIS DANS LE MONDE',
    'dash.rarest': 'SUCCÈS LE PLUS RARE',
    'dash.thisWeek': 'cette semaine',
    'dash.session': 'SESSION',
    'dash.completion': '% complété',
    'dash.nextMilestone': 'PROCHAIN PALIER · 40%',
    'dash.toGo': 'restants',
    'dash.hrsTotal': 'h au total',
    'dash.hrsPerDay': 'h/jour moy.',
    'dash.global': 'complétion globale',
    'dash.leader': 'Premier',
    'dash.rank': 'RANG',
    'dash.inLibrary': 'dans la bibliothèque',
    'dash.lastSession': 'dernière session',

    'tip.gamesOwned': 'Tous les jeux de votre compte Steam, y compris gratuits et cadeaux.',
    'tip.dlcOwned': 'Extensions et contenus additionnels possédés dans votre bibliothèque.',
    'tip.totalHours': "Temps de jeu total sur l'ensemble des jeux suivis par Steam.",
    'tip.weeklyAvg': 'Total des heures jouées sur 7 jours divisé par 7.',
    'tip.achRate': 'Succès débloqués divisés par le total disponible parmi vos jeux.',
    'tip.dlcRatio': 'Nombre moyen de DLC par jeu de base dans votre bibliothèque.',

    'profile.member': 'Membre depuis sept. 2014',
    'profile.showcase': 'VITRINE · MEILLEURS JEUX',
    'profile.badges': 'BADGES',
    'profile.badgesEarned': '12 obtenus',
    'profile.quickFacts': 'EN BREF',
    'profile.country': 'Pays',
    'profile.joined': 'Inscrit',
    'profile.avgSession': 'Session moy.',
    'profile.bestWeek': 'Meilleure semaine',
    'profile.genres': 'Genres joués',
    'profile.reviews': 'Évaluations écrites',
    'profile.workshop': 'Objets workshop',

    'lib.byPlay': 'PAR TEMPS DE JEU',
    'lib.recent': 'RÉCENTS',
    'lib.alpha': 'A → Z',
    'lib.placeholder': 'rechercher dans votre bibliothèque…',
    'lib.noMatch': 'Aucun jeu ne correspond à',
    'lib.totalGames': 'jeux',
    'lib.totalHrs': 'heures au total',

    'ach.unlocked': 'DÉBLOQUÉS',
    'ach.rare': 'RARES (< 5%)',
    'ach.perfect': 'JEUX PARFAITS',
    'ach.globalRate': 'TAUX GLOBAL',
    'ach.byGame': 'PAR JEU',
    'ach.recentUnlocks': 'DÉBLOCAGES RÉCENTS',
    'ach.rarity': 'RARETÉ',
    'ach.unlockedSuffix': 'débloqués',

    'friends.all': 'TOUS',
    'friends.online': 'EN LIGNE',
    'friends.ingame': 'EN JEU',
    'friends.offline': 'HORS LIGNE',
    'friends.addFriend': '+ AJOUTER UN AMI',
    'friends.total': 'au total',

    'search.title': 'Recherche globale',
    'search.placeholder': 'rechercher jeux, genres, studios…',
    'search.recent': 'Récents',
    'search.suggestions': 'Essayez',

    'sound.mute': 'Couper',
    'sound.unmute': 'Activer',

    'theme.label': 'Thème',

    'cache.stale': 'Les données en cache peuvent avoir plus de 2 jours. Appuyez sur Ctrl+F5 pour forcer une mise à jour.',
    'cache.dismiss': 'ignorer',

    'err.404.title': '404 · INTROUVABLE',
    'err.404.body': "Cette page se cache dans un coffre d'une autre zone. Essayez la barre latérale.",
    'err.403.title': '403 · VERROUILLÉ',
    'err.403.body': "Vous avez besoin d'une carte d'accès. Continuez votre quête ailleurs.",
    'err.500.title': '500 · COUP CRITIQUE',
    'err.500.body': 'Le serveur a subi 9999 dégâts. Respawn dans un instant.',
    'err.api.title': 'API STEAM · QUOTA DÉPASSÉ',
    'err.api.body': "Trop de requêtes. Attendez la fin du cooldown (environ 5 min).",
    'err.back': '← RETOUR À LA BASE',
  },
}

const lang = ref<LangKey>((localStorage.getItem('sf-lang') as LangKey) ?? 'en')

export function useI18n() {
  function setLang(l: LangKey) {
    lang.value = l
    localStorage.setItem('sf-lang', l)
  }
  function t(key: string): string {
    return SF_I18N[lang.value]?.[key] ?? SF_I18N.en[key] ?? key
  }
  return { lang: readonly(lang), setLang, t }
}
