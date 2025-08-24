type ApiMethod = "GET" | "POST" | "DELETE" | "PATCH";

export async function fetchData({
  url,
  method,
  body,
  hostToken,
  userToken,
}: {
  url: string;
  method: ApiMethod;
  body?: Record<string, unknown>;
  hostToken?: string;
  userToken?: string;
}) {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(hostToken ? { Authorization: `Bearer ${hostToken}` } : {}),
      ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const errorResponse = await response.json();
    throw {
      error: errorResponse,
    };
  }

  return response.json();
}
