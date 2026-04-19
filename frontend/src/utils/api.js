// Get the API base URL - uses env var in production, empty string for dev proxy
export const getApiUrl = (path) => {
  const envBase = (import.meta.env.VITE_API_BASE || '').trim()
  const isPlaceholder = /your-render-url\.onrender\.com/i.test(envBase)
  const base = !envBase || isPlaceholder
    ? (import.meta.env.PROD ? 'https://loanwizard.onrender.com' : '')
    : envBase
  return base ? `${base}${path}` : path
}
