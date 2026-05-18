<script setup lang="ts">
import NavBar from '@/components/layout/NavBar.vue'
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <NavBar />

    <main class="mx-auto max-w-6xl px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
