export function useLocalStorage() {
  const get = <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const set = <T>(key: string, value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('localStorage full or unavailable', e)
    }
  }

  const remove = (key: string) => localStorage.removeItem(key)

  return { get, set, remove }
}
