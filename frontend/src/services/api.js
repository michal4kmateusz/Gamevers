
import axios from 'axios'

// Główny klient HTTP dla API Laravel.
// Adres można zmienić przez zmienną VITE_API_URL.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000/api',

  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  },

  timeout: 10000
})

export default api
