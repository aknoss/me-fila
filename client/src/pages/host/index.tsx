import { useAuth } from "../../providers/useAuth"
import { HostSession } from "./HostSession"
import { HostForm } from "./HostForm"
import { Role } from "../../providers/AuthProvider.types"

export function HostPage() {
  const { accessToken, role } = useAuth()

  if (accessToken && role === Role.HOST) {
    return <HostSession />
  }

  return <HostForm />
}
