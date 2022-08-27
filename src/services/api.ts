import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../context/AuthContext';

const cookies = parseCookies()
let isResfreshing = false
const failedRequestsQueue = []

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
});

api.interceptors.response.use(res => {
  return res
}, (error: AxiosError) => {
  if (error.response.status === 401) {
    if (error.response.data?.code === 'token.expired') {

      const cookies = parseCookies()
      const { 'nextauth.refreshToken': refreshToken } = cookies
      const originalConfig  = error.config

      if (!isResfreshing) {
        isResfreshing = true
        console.log('Antigo refresh token: ', refreshToken)

        api.post('/refresh', {
          refreshToken
        }).then(response => {
          const { token, refreshToken } = response.data
          console.log('Atual refresh token: ', refreshToken)
          setCookie(undefined, 'nextauth.refreshtoken', refreshToken, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
          })
  
          setCookie(undefined, 'nextauth.token', token, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/'
          })
  
          api.defaults.headers['Authorization'] = `Bearer ${token}`
        }).catch(err => {
          failedRequestsQueue.forEach(request => request.onFailure(err))

        })
      }

      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => {
            originalConfig.headers['Authorization'] = `Bearer ${token}`

            resolve(api(originalConfig))
          },
          onFailure: (err: AxiosError) => {
            reject(err)
          }
        })
      })
    } else {
      signOut()
    }
  }

  return Promise.reject(error)
})