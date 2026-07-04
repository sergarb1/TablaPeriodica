<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  electronShells: number[]
  symbol: string
  color: string
  size?: number
}>()

const size = computed(() => props.size ?? 160)

const shells = computed(() => {
  return props.electronShells.map((count, i) => ({
    level: i + 1,
    count,
    radius: 18 + i * 22,
    speed: 0.8 + i * 0.3
  }))
})

const electrons = ref<{ level: number; angle: number; radius: number; speed: number }[]>([])

function initElectrons() {
  const result: { level: number; angle: number; radius: number; speed: number }[] = []
  for (const s of shells.value) {
    for (let j = 0; j < s.count; j++) {
      result.push({
        level: s.level,
        angle: (j * 360) / s.count + s.level * 15,
        radius: s.radius,
        speed: s.speed
      })
    }
  }
  electrons.value = result
}

let animId: number | null = null
let lastTime = 0

function animate(time: number) {
  if (!lastTime) lastTime = time
  const dt = (time - lastTime) * 0.001
  lastTime = time
  electrons.value = electrons.value.map(e => ({
    ...e,
    angle: (e.angle + e.speed * 60 * dt) % 360
  }))
  animId = requestAnimationFrame(animate)
}

onMounted(() => {
  initElectrons()
  animId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})

const cx = computed(() => size.value / 2)
const cy = computed(() => size.value / 2)

function electronPos(radius: number, angle: number) {
  const rad = (angle * Math.PI) / 180
  return {
    x: cx.value + radius * Math.cos(rad) - 4,
    y: cy.value + radius * Math.sin(rad) - 4
  }
}
</script>

<template>
  <div class="relative shrink-0" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="absolute inset-0">
      <circle :cx="cx" :cy="cy" :r="size * 0.06" :fill="color" class="drop-shadow-md" />
      <text :x="cx" :y="cy + 0.5" text-anchor="middle" dominant-baseline="central" fill="white" :font-size="size * 0.07" font-weight="bold">{{ symbol }}</text>

      <circle v-for="(s, i) in shells" :key="'o'+i" :cx="cx" :cy="cy" :r="s.radius" fill="none" :stroke="color + '30'" stroke-width="1.5" stroke-dasharray="3 3" />
    </svg>

    <div v-for="(e, i) in electrons" :key="i" class="absolute w-2 h-2 rounded-full transition-none" :style="{ backgroundColor: color, left: electronPos(e.radius, e.angle).x + 'px', top: electronPos(e.radius, e.angle).y + 'px' }" />
  </div>
</template>
