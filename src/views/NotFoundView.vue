<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
defineOptions({ name: 'NotFoundView' })
const router = useRouter()
const { t } = useI18n()
</script>

<template>
  <div class="errpage">
    <div class="err-bigcode" style="color:var(--accent)">404</div>
    <div class="err-title">{{ t('err.404.title') }}</div>
    <div class="err-body">{{ t('err.404.body') }}</div>
    <button class="err-back" @click="router.push('/dashboard')">{{ t('err.back') }}</button>
  </div>
</template>
