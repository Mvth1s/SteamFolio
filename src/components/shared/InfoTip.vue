<script setup lang="ts">
import { ref } from 'vue'
defineOptions({ name: 'InfoTip' })
defineProps<{ content: string }>()

const show = ref(false)
const x = ref(0)
const y = ref(0)

function onEnter(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  x.value = rect.left + rect.width / 2
  y.value = rect.top - 8
  show.value = true
}
</script>

<template>
  <span
    class="sf-info"
    @mouseenter="onEnter"
    @mouseleave="show = false"
    role="tooltip"
    aria-label="info"
  >?</span>

  <Teleport to="body">
    <div
      v-if="show"
      class="sf-tooltip"
      :style="{ left: `${x}px`, top: `${y}px`, transform: 'translate(-50%, -100%)' }"
    >
      {{ content }}
      <span class="arrow" style="bottom:-4px;left:50%;transform:translateX(-50%) rotate(45deg)" />
    </div>
  </Teleport>
</template>
