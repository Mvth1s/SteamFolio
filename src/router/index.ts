import { createRouter, createWebHistory } from 'vue-router'
import AchievementsView from '@/views/AchievementsView.vue'
import FriendsView from '@/views/FriendsView.vue'
import LibraryView from '@/views/LibraryView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/profile',
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/library',
      name: 'library',
      component: LibraryView,
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: AchievementsView,
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
    },
  ],
})

export default router
