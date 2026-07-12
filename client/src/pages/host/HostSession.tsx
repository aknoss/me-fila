import { useState } from "react"
import { Navigate } from "react-router"
import { Wrapper } from "../../components/Wrapper"
import {
  useDeleteRoomMutation,
  useGetRoomQuery,
  useGetRoomUsersQuery,
  useRemoveUserFromRoomMutation,
} from "../../api/roomApi"
import { ROUTES } from "../../constants/routes"
import { ErrorMessage } from "../../components/ErrorMessage"
import { ConfirmModal } from "../../components/ConfirmModal"
import { Button } from "../../components/Button"
import { useAuth } from "../../providers/useAuth"
import { Role } from "../../providers/AuthProvider.types"
import Spinner from "../../assets/spinner.svg"
import { Share2, Trash2 } from "lucide-react"

const ROOM_REFETCH_INTERVAL = 3000

export function HostSession() {
  const { accessToken, role, roomId, logout } = useAuth()
  const [userPendingRemoval, setUserPendingRemoval] = useState<{
    id: string
    name: string
  } | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const { data: roomData } = useGetRoomQuery(roomId!, {
    queryKey: [],
    enabled: !!roomId,
  })

  const {
    data: usersData,
    isError: isGetUsersError,
    refetch: refetchUsers,
  } = useGetRoomUsersQuery(roomId!, accessToken!, {
    queryKey: [],
    refetchInterval: ROOM_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  })

  const { mutate: removeUser } = useRemoveUserFromRoomMutation({
    onSuccess: () => refetchUsers(),
  })

  const {
    mutate,
    isPending: isDeleteRoomPending,
    isError: isDeleteRoomError,
  } = useDeleteRoomMutation({
    onSuccess: () => {
      logout()
    },
    onError: (error) => {
      if (error.error.code === 404) {
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

  const handleFinish = (userId: string) => {
    removeUser({ roomId, userId, accessToken })
  }

  const confirmRemoval = () => {
    if (userPendingRemoval) {
      removeUser({ roomId, userId: userPendingRemoval.id, accessToken })
      setUserPendingRemoval(null)
    }
  }

  const users = usersData?.data.users ?? []
  const shareUrl = `${window.location.origin}/room/${roomId}`

  const handleShare = () => {
    window.open(shareUrl, "_blank", "noopener,noreferrer")
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    })
  }

  return (
    <Wrapper>
      <div className="flex flex-col items-center gap-4 w-full">
        <h1 className="text-3xl font-semibold text-center">
          {roomData?.data.name}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 active:bg-primary/80 rounded-md px-4 h-12 cursor-pointer"
          >
            <Share2 size={18} />
            {shareCopied ? "Link copiado!" : "Compartilhar"}
          </button>
          <button
            onClick={handleDeleteQueue}
            disabled={isDeleteRoomPending}
            aria-label="Deletar fila"
            className="text-red-500 hover:text-red-700 cursor-pointer p-2 disabled:opacity-50"
          >
            {isDeleteRoomPending ? (
              <img src={Spinner} width={18} />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      </div>
      {usersData ? (
        users.length > 0 ? (
          <div className="flex flex-col gap-2 w-64">
            {users.map((item, index) => {
              const isBeingAttended = index === 0
              return (
                <div
                  key={item.id}
                  className={
                    isBeingAttended
                      ? "flex flex-col gap-2 px-4 py-3 rounded-lg bg-primary text-white"
                      : "flex items-center justify-between px-4 py-2 rounded-lg bg-section"
                  }
                >
                  <div className="flex items-center justify-between gap-4 w-full">
                    <p>
                      <span className="opacity-70">{index + 1}.</span> {item.name}
                    </p>
                    {!isBeingAttended && (
                      <button
                        onClick={() =>
                          setUserPendingRemoval({ id: item.id, name: item.name })
                        }
                        aria-label={`Remover ${item.name}`}
                        className="cursor-pointer py-1 pl-2 opacity-80 hover:opacity-100"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {isBeingAttended && (
                    <Button variant="secondary" onClick={() => handleFinish(item.id)}>
                      Finalizar atendimento
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p>A fila está vazia</p>
        )
      ) : null}
      {isGetUsersError ||
        (isDeleteRoomError && (
          <ErrorMessage>
            Algo deu errado. Por favor tente novamente
          </ErrorMessage>
        ))}
      {userPendingRemoval && (
        <ConfirmModal
          title="Remover da fila"
          message={`Tem certeza que deseja remover ${userPendingRemoval.name} da fila?`}
          confirmLabel="Remover"
          onConfirm={confirmRemoval}
          onCancel={() => setUserPendingRemoval(null)}
        />
      )}
    </Wrapper>
  )
}
