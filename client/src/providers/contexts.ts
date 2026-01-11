import { createContext } from "react";
import type { AuthContextType } from "./AuthProvider";

export const AuthContext = createContext<AuthContextType>({
  hostToken: null,
  roomId: null,
  loginHost: () => {},
  userToken: null,
  username: null,
  loginUser: () => {},
  logout: () => {},
});
