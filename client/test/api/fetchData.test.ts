import { describe, it, expect, vi, beforeEach } from "vitest"
import { fetchData } from "../../src/api/fetchData"

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("fetchData", () => {
  it("GET without body or token", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ok: true }, error: null }),
    } as Response)

    const result = await fetchData({ url: "/x", method: "GET" })
    expect(result.data.ok).toBe(true)
    expect(fetchSpy).toHaveBeenCalledWith(
      "/x",
      expect.objectContaining({
        method: "GET",
        headers: { "Content-Type": "application/json" },
        body: undefined,
      })
    )
  })

  it("POST with body and accessToken sets headers + JSON body", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: {}, error: null }),
    } as Response)

    await fetchData({
      url: "/x",
      method: "POST",
      body: { a: 1 },
      accessToken: "tok",
    })
    const call = fetchSpy.mock.calls[0]
    const init = call[1] as RequestInit
    expect(init.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer tok",
    })
    expect(init.body).toBe(JSON.stringify({ a: 1 }))
  })

  it("throws when response.ok is false", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ data: null, error: { message: "no", code: 400 } }),
    } as Response)

    await expect(fetchData({ url: "/x", method: "GET" })).rejects.toMatchObject({
      error: { error: { message: "no", code: 400 } },
    })
  })
})
