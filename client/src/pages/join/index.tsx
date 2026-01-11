import { useAuth } from "../../providers/useAuth"
import { JoinForm } from "./JoinForm"
import { JoinSession } from "./JoinSession"

export function JoinPage() {
  const { userToken } = useAuth()

  if (userToken) {
    return <JoinSession />
  }

  return <JoinForm />
}
