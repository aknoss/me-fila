export enum Role {
  HOST = "HOST",
  USER = "USER",
}

export type AuthContextType = {
  accessToken: string | null
  role: Role | null
  roomId: string | null
  username: string | null
  login: ({
    accessToken,
    role,
    roomId,
    username,
  }: {
    accessToken: string
    role: Role
    roomId: string
    username?: string
  }) => void
  logout: () => void
}
