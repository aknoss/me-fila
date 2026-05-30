import { describe, it, expect } from "vitest"
import { LocalStorage } from "../src/constants/localStorage"
import { ROUTES } from "../src/constants/routes"
import { API_METHOD, API_ROUTES } from "../src/constants/apiRoutes"

describe("constants", () => {
  it("LocalStorage keys", () => {
    expect(LocalStorage.ACCESS_TOKEN).toBe("accessToken")
    expect(LocalStorage.ROOM_ID).toBe("roomId")
    expect(LocalStorage.USERNAME).toBe("username")
  })

  it("ROUTES", () => {
    expect(ROUTES.HOME).toBe("/")
    expect(ROUTES.HOST).toBe("/host")
    expect(ROUTES.JOIN).toBe("/join")
    expect(ROUTES.HOST_ID).toBe("/host/:id")
  })

  it("API_METHOD enum", () => {
    expect(API_METHOD.GET).toBe("GET")
    expect(API_METHOD.POST).toBe("POST")
    expect(API_METHOD.DELETE).toBe("DELETE")
    expect(API_METHOD.PATCH).toBe("PATCH")
  })

  it("API_ROUTES interpolate backend url", () => {
    expect(API_ROUTES.ROOMS).toBe("http://test.local/rooms")
    expect(API_ROUTES.USERS).toBe("http://test.local/users")
  })
})
