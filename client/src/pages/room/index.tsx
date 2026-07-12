import { useParams } from "react-router"
import { QRCodeSVG } from "qrcode.react"
import { Wrapper } from "../../components/Wrapper"
import { ErrorMessage } from "../../components/ErrorMessage"
import { ROUTES } from "../../constants/routes"
import { useGetRoomQuery } from "../../api/roomApi"
import Spinner from "../../assets/spinner.svg"

export function RoomPage() {
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError } = useGetRoomQuery(id!, {
    queryKey: [],
    enabled: !!id,
    retry: false,
  })

  const joinUrl = `${window.location.origin}${ROUTES.JOIN}?id=${id}`

  if (isLoading) {
    return (
      <Wrapper>
        <img src={Spinner} width={36} />
      </Wrapper>
    )
  }

  if (isError || !data) {
    return (
      <Wrapper>
        <ErrorMessage>Fila não encontrada</ErrorMessage>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <h1 className="text-3xl font-semibold text-center">{data.data.name}</h1>
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG value={joinUrl} size={240} />
      </div>
      <span className="opacity-70">Id da fila: {data.data.id}</span>
    </Wrapper>
  )
}
