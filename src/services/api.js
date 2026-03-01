import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const createOcrPaste = async ({ base64Image, ttl }) => {
  const body = { base64Image }
  if (ttl && !isNaN(ttl) && Number(ttl) > 0) body.ttl = Number(ttl)
  const { data } = await api.post('/ocr', body)
  return data
}

export const createPaste = async ({ content, ttl }) => {
  const body = { content }
  if (ttl && !isNaN(ttl) && Number(ttl) > 0) body.ttl = Number(ttl)
  const { data } = await api.post('/paste', body)
  return data
}

export const getPaste = async (keyID) => {
  const { data } = await api.get(`/paste/${keyID}`)
  return data
}

export const deletePaste = async (keyID) => {
  await api.delete(`/paste/${keyID}`)
}

export default api
