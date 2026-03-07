import { useRef, useState } from "react"
import { Input } from "../../components/Input"
import { Wrapper } from "../../components/Wrapper"
import { ButtonLink } from "../../components/ButtonLink"
import { ROUTES } from "../../constants/routes"
import { Button } from "../../components/Button"
import { ButtonGroup } from "../../components/ButtonGroup"
import { useCreateUserMutation } from "../../api/userApi"
import { useJoinRoomMutation } from "../../api/roomApi"
import { useAuth } from "../../providers/useAuth"
import { ErrorMessage } from "../../components/ErrorMessage"
import { Role } from "../../providers/AuthProvider.types"

export function JoinForm() {
  const [roomIdInput, setRoomIdInput] = useState("")
  const [roomIdError, setRoomIdError] = useState(false)
  const [username, setUsername] = useState("")
  const { login } = useAuth()
  const userAccessTokenRef = useRef<string | null>(null)

  const {
    mutateAsync: createUserMutateAsync,
    isPending: createUserMutateIsPending,
    isError: createUserMutateIsError,
  } = useCreateUserMutation()

  const {
    mutateAsync: joinRoomMutateAsync,
    isPending: joinRoomMutateIsPending,
    isError: joinRoomMutateIsError,
  } = useJoinRoomMutation({
    onSuccess: (data) => {
      login({
        accessToken: userAccessTokenRef.current!,
        role: Role.USER,
        username: data.data.name,
        roomId: data.data.room_id!,
        userId: data.data.id,
      })
    },
  })

  const handleChangeQueueId = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomIdInput(event.target.value)
    setRoomIdError(false)
  }

  const handleChangeUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (roomIdInput === "") {
      setRoomIdError(true)
      return
    }

    const user = await createUserMutateAsync({ name: username })
    userAccessTokenRef.current = user.data.accessToken
    await joinRoomMutateAsync({
      accessToken: user.data.accessToken,
      roomId: roomIdInput,
    })
  }

  return (
    <Wrapper>
      <h1 className="text-5xl">Entrar em Fila</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-16 w-full">
        <div className="w-full flex flex-col gap-4">
          <Input
            id="queue-id"
            label="ID da Fila"
            isError={roomIdError}
            errorMessage="Insira um id por favor"
            value={roomIdInput}
            onChange={handleChangeQueueId}
          />
          <Input
            id="username"
            label="Seu Nome"
            value={username}
            onChange={handleChangeUsername}
          />
        </div>
        <ButtonGroup>
          <Button
            type="submit"
            isLoading={createUserMutateIsPending || joinRoomMutateIsPending}
          >
            Continuar
          </Button>
          <ButtonLink to={ROUTES.HOME}>Voltar</ButtonLink>
          {(createUserMutateIsError || joinRoomMutateIsError) && (
            <ErrorMessage>
              Algo deu errado. Por favor tente novamente
            </ErrorMessage>
          )}
        </ButtonGroup>
      </form>
    </Wrapper>
  )
}
