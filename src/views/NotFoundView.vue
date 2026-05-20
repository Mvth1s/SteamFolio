<script setup lang="ts">
import ErrorView from './ErrorView.vue'
defineOptions({ name: 'NotFoundView' })
</script>

<template>
  <ErrorView kind="404" />
</template>
