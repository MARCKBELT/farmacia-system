import axios from 'axios'

const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AUTH,
})

const productsApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_PRODUCTS,
})

const inventoryApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_INVENTORY,
})

const salesApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_SALES,
})

const addAuthInterceptor = (api: typeof axios) => {
  api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  })
}

addAuthInterceptor(authApi)
addAuthInterceptor(productsApi)
addAuthInterceptor(inventoryApi)
addAuthInterceptor(salesApi)

export { authApi, productsApi, inventoryApi, salesApi }
