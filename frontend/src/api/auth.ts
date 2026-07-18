import api from './client'

export const register = async (email: string, username: string, password: string) => {
  const res = await api.post('/auth/register', { email, username, password })
  return res.data
}

export const login = async (email: string, password: string) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data as { access_token: string; token_type: string }
}

export const getMe = async () => {
  const res = await api.get('/auth/me')
  return res.data
}
