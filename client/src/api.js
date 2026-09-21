import axios from 'axios'

// Set VITE_USE_MOCK=true in client/.env.local to run without a backend
// (tasks are kept in the browser's localStorage). Remove it to use the real API.
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const http = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' })

const TOKEN_KEY = 'stm-token'
export const getToken = () => localStorage.getItem(TOKEN_KEY)
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
const clearToken = () => localStorage.removeItem(TOKEN_KEY)

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const auth = {
  isAuthenticated: () => Boolean(getToken()),
  register: async ({ name, email, password }) => {
    const { data } = await http.post('/auth/register', { name, email, password })
    setToken(data.token)
    return data.user
  },
  login: async ({ email, password }) => {
    const { data } = await http.post('/auth/login', { email, password })
    setToken(data.token)
    return data.user
  },
  logout: clearToken,
}

const KEY = 'stm-mock-tasks'
const read = () => JSON.parse(localStorage.getItem(KEY) || '[]')
const write = (tasks) => localStorage.setItem(KEY, JSON.stringify(tasks))

const mock = {
  list: async () => read(),
  create: async (data) => {
    const task = { ...data, status: 'todo', _id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    write([task, ...read()])
    return task
  },
  update: async (id, data) => {
    let updated
    write(read().map((t) => (t._id === id ? (updated = { ...t, ...data }) : t)))
    return updated
  },
  remove: async (id) => write(read().filter((t) => t._id !== id)),
}

const real = {
  list: async () => (await http.get('/tasks')).data,
  create: async (data) => (await http.post('/tasks', data)).data,
  update: async (id, data) => (await http.put(`/tasks/${id}`, data)).data,
  remove: async (id) => {
    await http.delete(`/tasks/${id}`)
  },
}

export default USE_MOCK ? mock : real
