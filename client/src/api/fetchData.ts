type ApiMethod = "GET" | "POST" | "DELETE" | "PATCH"

export async function fetchData({
  url,
  method,
  body,
  accessToken,
}: {
  url: string
  method: ApiMethod
  body?: Record<string, unknown>
  accessToken?: string
}) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorResponse = await response.json()
    throw {
      error: errorResponse,
    }
  }

  return response.json()
}
