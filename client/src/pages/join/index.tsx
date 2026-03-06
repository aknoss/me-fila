import { Role } from "../../providers/AuthProvider.types"
import { useAuth } from "../../providers/useAuth"
import { JoinForm } from "./JoinForm"
import { JoinSession } from "./JoinSession"

export function JoinPage() {
  const { accessToken, role } = useAuth()

  if (accessToken && role === Role.USER) {
    return <JoinSession />
  }

  return <JoinForm />
}
