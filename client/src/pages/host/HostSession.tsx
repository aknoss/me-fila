import { Navigate } from "react-router";
import { Wrapper } from "../../components/Wrapper";
import { Button } from "../../components/Button";
import { useDeleteRoomMutation, useGetRoomQuery } from "../../api/roomApi";
import { ROUTES } from "../../constants/routes";
import { ErrorMessage } from "../../components/ErrorMessage";
import { useAuth } from "../../providers/useAuth";

const ROOM_REFETCH_INTERVAL = 3000;

export function HostSession() {
  const { hostToken, roomId, logout } = useAuth();

  const { data: roomData, isError: isGetRoomError } = useGetRoomQuery(
    hostToken!,
    {
      // queryKey is set in the function implementation but is required by typescript here
      queryKey: [],
      refetchInterval: ROOM_REFETCH_INTERVAL,
    }
  );

  const {
    mutate,
    isPending: isDeleteRoomPending,
    isError: isDeleteRoomError,
  } = useDeleteRoomMutation({
    onSuccess: () => {
      logout();
    },
    onError: (error) => {
      if (error.error.error.code === 404) {
        logout();
      }
    },
  });

  if (!hostToken || !roomId) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  const handleDeleteQueue = () => {
    mutate({ hostToken });
  };

  return (
    <Wrapper>
      Id da fila: {roomId}
      <Button onClick={handleDeleteQueue} isLoading={isDeleteRoomPending}>
        Deletar Fila
      </Button>
      {roomData ? (
        roomData.data.room.participants.length > 0 ? (
          roomData?.data.room.participants.map((item) => (
            <p key={item.id}>{item.name}</p>
          ))
        ) : (
          <p>A lista está vazia</p>
        )
      ) : null}
      {isGetRoomError ||
        (isDeleteRoomError && (
          <ErrorMessage>
            Algo deu errado. Por favor tente novamente
          </ErrorMessage>
        ))}
    </Wrapper>
  );
}
