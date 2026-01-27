import { useCallback, useState } from "react"
import { AuthContext } from "./contexts"
import { AuthContextType, Role } from "./AuthProvider.types"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  )
  const [role, setRole] = useState<Role | null>(null)
  const [roomId, setRoomId] = useState<string | null>(
    localStorage.getItem("roomId")
  )
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem("username")
  )

  const login: AuthContextType["login"] = useCallback(
    ({
      accessToken: newAccessToken,
      role: newRole,
      roomId: newRoomId,
      username: newUsername,
    }) => {
      localStorage.setItem("accessToken", newAccessToken)
      localStorage.setItem("roomId", newRoomId)
      setAccessToken(newAccessToken)
      setRole(newRole)
      setRoomId(newRoomId)
      if (newUsername) {
        localStorage.setItem("username", newUsername)
        setUsername(newUsername)
      }
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.clear()
    setAccessToken(null)
    setRole(null)
    setRoomId(null)
    setUsername(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        role,
        roomId,
        username,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
