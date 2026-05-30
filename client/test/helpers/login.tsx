import { useEffect } from "react"
import { useAuth } from "../../src/providers/useAuth"
import { Role } from "../../src/providers/AuthProvider.types"

type LoginParams = Parameters<ReturnType<typeof useAuth>["login"]>[0]

export function LoginOnMount({
  params,
  children,
}: {
  params: LoginParams
  children: React.ReactNode
}) {
  const { login } = useAuth()
  useEffect(() => {
    login(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <>{children}</>
}

export const hostParams = (overrides: Partial<LoginParams> = {}): LoginParams => ({
  accessToken: "t",
  role: Role.HOST,
  roomId: "r",
  ...overrides,
})

export const userParams = (overrides: Partial<LoginParams> = {}): LoginParams => ({
  accessToken: "t",
  role: Role.USER,
  roomId: "r",
  username: "alice",
  userId: "u",
  ...overrides,
})
