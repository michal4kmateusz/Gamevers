
import axios from 'axios'

export const http = axios.create({
  baseURL: '/',
  withCredentials: true,
  withXSRFToken: true,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  headers: {
    Accept: 'application/json'
  },

  timeout: 15000
})

const api = axios.create({
  ...http.defaults,
  baseURL: '/api'
})

export default api


