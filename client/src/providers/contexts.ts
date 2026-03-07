import { createContext } from "react"
import { AuthContextType } from "./AuthProvider.types"

export const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  role: null,
  roomId: null,
  username: null,
  userId: null,
  login: () => {},
  logout: () => {},
})
