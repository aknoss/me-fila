import { useAuth } from "../../providers/useAuth"
import { JoinForm } from "./JoinForm"
import { JoinSession } from "./JoinSession"

export function JoinPage() {
  const { accessToken, role } = useAuth()

  if (accessToken && role === "user") {
    return <JoinSession />
  }

  return <JoinForm />
}
