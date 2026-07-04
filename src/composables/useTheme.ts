import { ref, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'

const isDark = useLocalStorage('theme-dark', window.matchMedia('(prefers-color-scheme: dark)').matches)

export function useTheme() {
  const applyTheme = () => {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  watch(isDark, applyTheme, { immediate: true })

  return {
    isDark,
    toggle: () => { isDark.value = !isDark.value }
  }
}
