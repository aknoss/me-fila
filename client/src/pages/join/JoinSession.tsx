import { Navigate } from "react-router"
import { Wrapper } from "../../components/Wrapper"
import { ROUTES } from "../../constants/routes"
import { useAuth } from "../../providers/useAuth"
import { Button } from "../../components/Button"

export function JoinSession() {
  const { userToken, username, roomId, logout } = useAuth()

  if (!userToken || !username) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <Wrapper>
      JOIN SESSION
      <p>Username: {username}</p>
      <Button onClick={logout}>Sair</Button>
      <p>ID da fila: {roomId}</p>
    </Wrapper>
  )
}
