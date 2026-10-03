<script setup lang="ts">
import { useCookieConsent } from '@/composables/useCookieConsent'
import { useI18n } from '@/composables/useI18n'
import { useSound } from '@/composables/useSound'

defineOptions({ name: 'CookieBanner' })

const { bannerOpen, accept, refuse } = useCookieConsent()
const { t } = useI18n()
const { click } = useSound()
</script>

<template>
  <Teleport to="body">
    <section
      v-if="bannerOpen"
      class="sf-cookie"
      role="dialog"
      aria-labelledby="sf-cookie-title"
      aria-describedby="sf-cookie-body"
    >
      <div id="sf-cookie-title" class="sf-cookie-title">🍪 {{ t('cookie.title') }}</div>
      <p id="sf-cookie-body" class="sf-cookie-body">{{ t('cookie.body') }}</p>
      <div class="sf-cookie-actions">
        <button class="sf-cookie-btn" @click="refuse(); click()">{{ t('cookie.refuse') }}</button>
        <button class="sf-cookie-btn" @click="accept(); click()">{{ t('cookie.accept') }}</button>
      </div>
    </section>
  </Teleport>
</template>
