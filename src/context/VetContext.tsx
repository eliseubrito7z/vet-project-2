/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable array-callback-return */
import Router from 'next/router'
import { createContext, ReactNode, useEffect, useState } from 'react'
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { api } from '../services/apiClient'

export interface User {
  id: number
  avatarUrl: string
  fullName: string
  role: {
    code: number
    description: string
  }
}

type SignInCredentials = {
  email: string
  password: string
  remember: boolean
}

type VetContextData = {
  user: User | undefined
  servicesCategorized: any
  logout(): void
  signIn(credentials: SignInCredentials): Promise<void>
}

export const VetContext = createContext({} as VetContextData)

interface VetContextProviderProps {
  children: ReactNode
}

export function signOut() {
  destroyCookie(undefined, 'vet.token')
  destroyCookie(undefined, 'vet.refreshToken')
  Router.push('/login')
}

export function VetContextProvider({ children }: VetContextProviderProps) {
  const [user, setUser] = useState<User | undefined>()

  const servicesCategorized = {
    exams: [],
    surgerys: [],
    emergencys: [],
    medicalCare: [],
  }

  async function signIn({ email, password, remember }: SignInCredentials) {
    const { data } = await api.post(
      '/auth/signin',
      {
        username: email,
        password,
      },
      {
        headers: {
          Authorization: '',
        },
      },
    )

    const { accessToken: token, refreshToken } = data
    const authenticated = data.authenticated

    api.defaults.headers.Authorization = `Bearer ${token}`

    if (authenticated) {
      // 30 days : 24h
      const maxAgeValue = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24
      setCookie(undefined, 'vet.token', token, {
        maxAge: maxAgeValue,
        path: '/',
      })

      setCookie(undefined, 'vet.refreshToken', refreshToken, {
        maxAge: maxAgeValue,
        path: '/',
      })

      api
        .get('/api/staff/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const data = response.data

          const user: User = {
            ...data,
            role: {
              code: data.role.id,
              ...data.role,
            },
          }

          setUser(user)
          Router.push('/dashboard')
        })
        .catch(() => {
          Router.push('/login')
        })
    }
  }

  useEffect(() => {
    const { 'vet.token': token } = parseCookies()

    // if (token === undefined) {
    //   Router.push('/login')
    // }

    if (token) {
      api
        .get('/api/staff/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const data = response.data

          const user: User = {
            ...data,
            role: {
              code: data.role.id,
              ...data.role,
            },
          }

          setUser(user)
        })
        .catch(() => {
          signOut()
        })
    }
  }, [])

  function logout() {
    setUser(undefined)
    signOut()
  }

  return (
    <VetContext.Provider value={{ user, signIn, servicesCategorized, logout }}>
      {children}
    </VetContext.Provider>
  )
}
