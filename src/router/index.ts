import { createRouter, createWebHistory } from 'vue-router'
import { applyPageSeo } from '@/utils/seo'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: {
        title: 'Dashboard Steam | SteamFolio',
        description: "Vue d'ensemble du profil Steam : jeu en cours, temps de jeu récent, jeux les plus joués, badges et succès les plus rares.",
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: {
        title: 'Profil Steam | SteamFolio',
        description: 'Profil Steam de Mathis Aguado : niveau, jeux mis en avant, badges et statistiques clés du compte.',
      },
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/views/LibraryView.vue'),
      meta: {
        title: 'Bibliothèque de jeux Steam | SteamFolio',
        description: 'Bibliothèque de jeux Steam avec le temps de jeu de chaque titre, recherche et tri par nom ou par heures jouées.',
      },
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: () => import('@/views/AchievementsView.vue'),
      meta: {
        title: 'Succès Steam | SteamFolio',
        description: 'Succès Steam débloqués jeu par jeu : taux de complétion, derniers succès obtenus et succès restants.',
      },
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('@/views/FriendsView.vue'),
      meta: {
        title: 'Amis Steam | SteamFolio',
        description: "Liste d'amis Steam avec leur statut en ligne et leur avatar.",
      },
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: () => import('@/views/WishlistView.vue'),
      meta: {
        title: 'Liste de souhaits Steam | SteamFolio',
        description: 'Liste de souhaits Steam : jeux suivis, prix actuels, promotions en cours et dates de sortie.',
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: 'Page introuvable | SteamFolio',
      },
    },
  ],
})

router.afterEach((to) => {
  applyPageSeo({ title: to.meta.title, description: to.meta.description, path: to.path })
})

export default router
