import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const createOcrPaste = async ({ base64Image, ttl, password }) => {
  const body = { base64Image }

  if (ttl && !isNaN(ttl) && Number(ttl) > 0) {
    body.ttl = Number(ttl)
  }

  if (password && password.trim() !== '') {
    body.password = password
  }

  const { data } = await api.post('/ocr', body)
  return data
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
  return data
}

export const getPaste = async (keyID, password) => {
  const config = {}

  if (password) {
    config.params = { password }
  }

  const { data } = await api.get(`/paste/${keyID}`, config)
  return data
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
  return data
}

export default api
