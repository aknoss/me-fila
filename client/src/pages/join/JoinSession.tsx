import { useEffect } from "react"
import { Navigate } from "react-router"
import { Wrapper } from "../../components/Wrapper"
import { ROUTES } from "../../constants/routes"
import { useAuth } from "../../providers/useAuth"
import { Button } from "../../components/Button"
import { useDeleteUserMutation, useGetUserQuery } from "../../api/userApi"
import { Role } from "../../providers/AuthProvider.types"

const USER_REFETCH_INTERVAL = 3000

export function JoinSession() {
  const { accessToken, role, username, roomId, userId, logout } = useAuth()

  const { isError: isUserGone } = useGetUserQuery(userId!, accessToken!, {
    queryKey: [],
    refetchInterval: USER_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
    enabled: !!userId && !!accessToken,
    retry: false,
  })

  useEffect(() => {
    if (isUserGone) {
      logout()
    }
  }, [isUserGone, logout])

  const { mutate: deleteUserMutate } = useDeleteUserMutation({
    onSuccess: () => logout(),
  })

  const logoutAndDeleteUser = () => {
    if (accessToken && role === Role.USER && userId) {
      deleteUserMutate({ userId, accessToken })
    }
  }

  if (!accessToken || role !== Role.USER || !username) {
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
