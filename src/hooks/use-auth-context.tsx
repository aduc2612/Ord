import { createContext, useContext } from 'react'

export type AuthData = {
  claims: Record<string, unknown> | null | undefined
  profile: Record<string, unknown> | null | undefined
  isLoading: boolean
  isLoggedIn: boolean
}

export const AuthContext = createContext<AuthData>({
  claims: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
})

export const useAuthContext = () => useContext(AuthContext)
