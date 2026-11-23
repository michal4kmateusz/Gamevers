
import axios from 'axios'

// Wspólny klient API dla aplikacji Gamevers.
// Obsługuje uwierzytelnianie sesyjne Laravel Sanctum.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000/api',

  // Wysyłanie ciasteczek sesyjnych.
  withCredentials: true,

  // Obsługa tokenu CSRF przy żądaniach.
  withXSRFToken: true,

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },

  timeout: 10000
})

export default api
