import { AuthContext } from "../../src/providers/contexts"
import { Role } from "../../src/providers/AuthProvider.types"
import type { AuthContextType } from "../../src/providers/AuthProvider.types"

type Overrides = Partial<AuthContextType>

export function makeAuthValue(overrides: Overrides = {}): AuthContextType {
  return {
    accessToken: null,
    role: null,
    roomId: null,
    username: null,
    userId: null,
    login: () => {},
    logout: () => {},
    ...overrides,
  }
}

export function MockAuthProvider({
  value,
  children,
}: {
  value?: Overrides
  children: React.ReactNode
}) {
  return (
    <AuthContext.Provider value={makeAuthValue(value)}>
      {children}
    </AuthContext.Provider>
  )
}

export const hostValue = (overrides: Overrides = {}) =>
  makeAuthValue({
    accessToken: "t",
    role: Role.HOST,
    roomId: "r",
    ...overrides,
  })

export const userValue = (overrides: Overrides = {}) =>
  makeAuthValue({
    accessToken: "t",
    role: Role.USER,
    roomId: "r",
    username: "alice",
    userId: "u",
    ...overrides,
  })
