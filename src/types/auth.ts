export type Profile = {
  id: string
} & Record<string, unknown>

export type AuthData = {
  claims: Record<string, unknown> | null | undefined
  profile: Profile | null | undefined
  isLoading: boolean
  isLoggedIn: boolean
}
