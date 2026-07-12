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
  const { accessToken, role, username, userId, logout } = useAuth()

  const { data: userData, isError: isUserGone } = useGetUserQuery(
    userId!,
    accessToken!,
    {
      queryKey: [],
      refetchInterval: USER_REFETCH_INTERVAL,
      refetchIntervalInBackground: false,
      enabled: !!userId && !!accessToken,
      retry: false,
    }
  )

  const position = userData?.data.position

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
      <p>Username: {username}</p>
      <div className="flex flex-col items-center gap-2 bg-section px-8 py-6 rounded-lg">
        {position === 1 ? (
          <p className="text-primary text-2xl font-semibold">
            É a sua vez!
          </p>
        ) : position ? (
          <>
            <span className="text-primary text-5xl font-semibold">
              {position - 1}
            </span>
            <span className="opacity-70">
              {position - 1 === 1
                ? "pessoa na sua frente"
                : "pessoas na sua frente"}
            </span>
          </>
        ) : (
          <span className="opacity-70">Aguardando a fila...</span>
        )}
      </div>
      <Button onClick={logoutAndDeleteUser}>Sair</Button>
    </Wrapper>
  )
}
