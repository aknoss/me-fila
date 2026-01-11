import { Navigate } from "react-router"
import { ButtonGroup } from "../components/ButtonGroup"
import { ButtonLink } from "../components/ButtonLink"
import { Wrapper } from "../components/Wrapper"
import { ROUTES } from "../constants/routes"
import { useAuth } from "../providers/useAuth"

export function HomePage() {
  const { hostToken } = useAuth()

  if (hostToken) {
    return <Navigate to={ROUTES.HOST} />
  }

  return (
    <Wrapper>
      <h1 className="text-6xl">Me Fila</h1>
      <ButtonGroup>
        <ButtonLink to={ROUTES.JOIN}>Entrar em Fila</ButtonLink>
        <ButtonLink to={ROUTES.HOST}>Criar Fila</ButtonLink>
      </ButtonGroup>
    </Wrapper>
  )
}
