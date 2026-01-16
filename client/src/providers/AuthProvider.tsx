import { useCallback, useState } from "react"
import { AuthContext } from "./contexts"
import { LocalStorage } from "../constants/localStorage"

export type AuthContextType = {
  hostToken: string | null
  roomId: string | null
  userToken: string | null
  username: string | null
  loginHost: ({
    hostToken,
    roomId,
  }: {
    hostToken: string
    roomId: string
  }) => void
  loginUser: ({
    userToken,
    username,
    roomId,
  }: {
    userToken: string
    username: string
    roomId: string
  }) => void
  logout: () => void
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [hostToken, setHostToken] = useState<string | null>(
    localStorage.getItem(LocalStorage.HOST_TOKEN)
  )
  const [roomId, setRoomId] = useState<string | null>(
    localStorage.getItem(LocalStorage.ROOM_ID)
  )
  const [userToken, setUserToken] = useState<string | null>(
    localStorage.getItem(LocalStorage.USER_TOKEN)
  )
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem(LocalStorage.USERNAME)
  )

  const loginHost = useCallback(
    ({
      hostToken: currentHostToken,
      roomId: currentRoomId,
    }: {
      hostToken: string
      roomId: string
    }) => {
      localStorage.setItem(LocalStorage.HOST_TOKEN, currentHostToken)
      localStorage.setItem(LocalStorage.ROOM_ID, currentRoomId)
      setHostToken(currentHostToken)
      setRoomId(currentRoomId)
    },
    []
  )

  const loginUser = useCallback(
    ({
      userToken: currentUserToken,
      username: currentUsername,
      roomId: currentRoomId,
    }: {
      userToken: string
      username: string
      roomId: string
    }) => {
      localStorage.setItem(LocalStorage.USER_TOKEN, currentUserToken)
      localStorage.setItem(LocalStorage.USERNAME, currentUsername)
      setUserToken(currentUserToken)
      setUsername(currentUsername)
      setRoomId(currentRoomId)
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.clear()
    setHostToken(null)
    setRoomId(null)
    setUserToken(null)
    setUsername(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        hostToken,
        roomId,
        loginHost,
        userToken,
        username,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
