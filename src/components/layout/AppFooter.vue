<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useCookieConsent } from '@/composables/useCookieConsent'
import { useI18n } from '@/composables/useI18n'

const { openBanner } = useCookieConsent()
const { t } = useI18n()
</script>

<template>
  <footer class="app-footer">
    <nav :aria-label="t('footer.legal')">
      <RouterLink :to="{ path: '/mentions-legales', hash: '#mentions' }">{{ t('footer.legal') }}</RouterLink>
      <RouterLink :to="{ path: '/mentions-legales', hash: '#confidentialite' }">{{ t('footer.privacy') }}</RouterLink>
      <button type="button" @click="openBanner">{{ t('cookie.settings') }}</button>
    </nav>
    <p>{{ t('footer.credits') }}</p>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 40px;
  padding-top: 16px;
  border-top: 1px solid var(--line-soft);
  font-family: var(--mono);
  font-size: 11px;
  color: var(--text-mute);
}
.app-footer nav { display: flex; flex-wrap: wrap; gap: 8px 18px; margin-bottom: 8px; }
.app-footer a,
.app-footer button {
  color: var(--text-dim);
  text-decoration: underline;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
.app-footer a:hover,
.app-footer button:hover { color: var(--accent); }
.app-footer p { margin: 0; }
</style>
