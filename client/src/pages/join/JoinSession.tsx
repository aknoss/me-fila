import { Navigate } from "react-router"
import { Wrapper } from "../../components/Wrapper"
import { ROUTES } from "../../constants/routes"
import { useAuth } from "../../providers/useAuth"
import { Button } from "../../components/Button"
import { useDeleteUserMutation } from "../../api/userApi"

export function JoinSession() {
  const { accessToken, role, username, roomId, logout } = useAuth()

  const { mutate: deleteUserMutate } = useDeleteUserMutation()

  const logoutAndDeleteUser = () => {
    if (accessToken && role === "user") {
      deleteUserMutate({ accessToken })
    }
  }

  if (!accessToken || role !== "user" || !username) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return (
    <Wrapper>
      JOIN SESSION
      <p>Username: {username}</p>
      <Button onClick={logoutAndDeleteUser}>Sair</Button>
      <p>ID da fila: {roomId}</p>
    </Wrapper>
  )
}
