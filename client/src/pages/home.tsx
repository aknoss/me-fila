import { Navigate } from "react-router"
import { ButtonGroup } from "../components/ButtonGroup"
import { ButtonLink } from "../components/ButtonLink"
import { Wrapper } from "../components/Wrapper"
import { ROUTES } from "../constants/routes"
import { useAuth } from "../providers/useAuth"
import { Role } from "@me-fila/shared/types"

export function HomePage() {
  const { accessToken, role } = useAuth()

  if (accessToken && role === Role.HOST) {
    return <Navigate to={ROUTES.HOST} />
  }

  return (
    <Wrapper>
      <h1 className="text-2xl">Me Fila</h1>
      <div className="flex flex-col gap-1 text-center">
        <p>Organize filas de espera de forma simples e rápida.</p>
        <p>
          Crie uma fila em segundos, compartilhe o código com seus convidados e
          acompanhe em tempo real quem está na espera.
        </p>
      </div>
      <ButtonGroup>
        <ButtonLink to={ROUTES.JOIN}>Entrar em Fila</ButtonLink>
        <ButtonLink to={ROUTES.HOST} variant="secondary">
          Criar Fila
        </ButtonLink>
      </ButtonGroup>
    </Wrapper>
  )
}
