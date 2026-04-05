import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

const unwrap = (data) => {
  if (data && typeof data.body === 'string') {
    return JSON.parse(data.body)
  }
  return data
}

api.interceptors.response.use(
  (response) => {
    const data = response.data

    if (data && data.statusCode && data.statusCode >= 400) {
      const parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body
      const error = new Error(parsed?.error || parsed?.message || 'Request failed')
      error.response = {
        status: data.statusCode,
        data: parsed,
      }
      return Promise.reject(error)
    }

    return response
  },
  (error) => Promise.reject(error)
)

export const createOcrPaste = async ({ base64Image, ttl, password }) => {
  const body = { base64Image }

  if (ttl && !isNaN(ttl) && Number(ttl) > 0) {
    body.ttl = Number(ttl)
  }

  if (password && password.trim() !== '') {
    body.password = password
  }

  const { data } = await api.post('/ocr', body)
  return unwrap(data)
}

export const createPaste = async ({ content, ttl, password }) => {
  const body = { content }

  if (ttl && !isNaN(ttl) && Number(ttl) > 0) {
    body.ttl = Number(ttl)
  }

  if (password && password.trim() !== '') {
    body.password = password
  }

  const { data } = await api.post('/paste', body)
  return unwrap(data)
}

export const getPaste = async (keyID, password) => {
  const config = {}

  if (password) {
    config.params = { password }
  }

  const { data } = await api.get(`/paste/${keyID}`, config)
  return unwrap(data)
}

export const deletePaste = async (keyID) => {
  await api.delete(`/paste/${keyID}`)
}

export const summarizePaste = async (keyID, password) => {
  const config = {}

  if (password) {
    config.params = { password }
  }

  const { data } = await api.get(`/paste/${keyID}/summarize`, config)
  return unwrap(data)
}

export default api