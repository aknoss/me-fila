import { useAuth } from "../../providers/useAuth"
import { HostSession } from "./HostSession"
import { HostForm } from "./HostForm"

export function HostPage() {
  const { accessToken, role } = useAuth()

  if (accessToken && role === "host") {
    return <HostSession />
  }

  return <HostForm />
}
