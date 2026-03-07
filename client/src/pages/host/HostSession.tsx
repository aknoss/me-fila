import { Navigate } from "react-router"
import { Wrapper } from "../../components/Wrapper"
import { Button } from "../../components/Button"
import { useDeleteRoomMutation, useGetRoomUsersQuery } from "../../api/roomApi"
import { ROUTES } from "../../constants/routes"
import { ErrorMessage } from "../../components/ErrorMessage"
import { useAuth } from "../../providers/useAuth"
import { Role } from "../../providers/AuthProvider.types"

const ROOM_REFETCH_INTERVAL = 3000

export function HostSession() {
  const { accessToken, role, roomId, logout } = useAuth()

  const { data: usersData, isError: isGetUsersError } = useGetRoomUsersQuery(
    roomId!,
    accessToken!,
    {
      queryKey: [],
      refetchInterval: ROOM_REFETCH_INTERVAL,
    }
  )

  const {
    mutate,
    isPending: isDeleteRoomPending,
    isError: isDeleteRoomError,
  } = useDeleteRoomMutation({
    onSuccess: () => {
      logout()
    },
    onError: (error) => {
      if (error.error.error.code === 404) {
        logout()
      }
    },
  })

  if (!accessToken || role !== Role.HOST || !roomId) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  const handleDeleteQueue = () => {
    mutate({ roomId, accessToken })
  }

  return (
    <Wrapper>
      Id da fila: {roomId}
      <Button onClick={handleDeleteQueue} isLoading={isDeleteRoomPending}>
        Deletar Fila
      </Button>
      {usersData ? (
        usersData.data.users.length > 0 ? (
          usersData.data.users.map((item) => (
            <p key={item.id}>{item.name}</p>
          ))
        ) : (
          <p>A lista está vazia</p>
        )
      ) : null}
      {isGetUsersError ||
        (isDeleteRoomError && (
          <ErrorMessage>
            Algo deu errado. Por favor tente novamente
          </ErrorMessage>
        ))}
    </Wrapper>
  )
}
