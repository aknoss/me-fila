import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { ROUTES } from "./constants/routes"
import { HomePage } from "./pages/home"
import { HostPage } from "./pages/host"
import { JoinPage } from "./pages/join"
import { RoomPage } from "./pages/room"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.HOST}>
          <Route index element={<HostPage />} />
        </Route>
        <Route path={ROUTES.JOIN}>
          <Route index element={<JoinPage />} />
        </Route>
        <Route path={ROUTES.ROOM} element={<RoomPage />} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} />} />
      </Routes>
    </BrowserRouter>
  )
}
