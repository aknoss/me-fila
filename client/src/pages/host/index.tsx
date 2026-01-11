import { useAuth } from "../../providers/useAuth"
import { HostSession } from "./HostSession"
import { HostForm } from "./HostForm"

export function HostPage() {
  const { hostToken } = useAuth()

  if (hostToken) {
    return <HostSession />
  }

  return <HostForm />
}
