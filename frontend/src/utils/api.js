// Get the API base URL - uses env var in production, empty string for dev proxy
export const getApiUrl = (path) => {
  const base = import.meta.env.VITE_API_BASE || ''
  return base ? `${base}${path}` : path
}
