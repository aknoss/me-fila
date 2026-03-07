export enum Role {
  HOST = "HOST",
  USER = "USER",
}

export type AuthContextType = {
  accessToken: string | null
  role: Role | null
  roomId: string | null
  username: string | null
  userId: string | null
  login: ({
    accessToken,
    role,
    roomId,
    username,
    userId,
  }: {
    accessToken: string
    role: Role
    roomId: string
    username?: string
    userId?: string
  }) => void
  logout: () => void
}
