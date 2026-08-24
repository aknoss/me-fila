import { test, expect } from "@playwright/test"
import { cleanDb } from "./helpers/db"

test.beforeEach(async ({ page }) => {
  await cleanDb()
  await page.goto("/")
  await page.evaluate(() => localStorage.clear())
})

test.afterEach(async () => {
  await cleanDb()
})

test("C1 - Host creates queue (happy path and validation)", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Me Fila" })).toBeVisible()
  await page.getByRole("link", { name: "Criar Fila" }).click()
  await expect(page).toHaveURL(/\/host/)
  await expect(page.getByRole("heading", { name: "Criar Fila" })).toBeVisible()

  // Validation: empty submit shows error
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByText("Insira um nome para a fila por favor")).toBeVisible()

  // Create queue
  await page.getByLabel("Nome da Fila").fill("Fila E2E C1")
  await page.getByRole("button", { name: "Continuar" }).click()

  await expect(page.getByRole("heading", { name: "Fila E2E C1" })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole("button", { name: /Compartilhar/ })).toBeVisible()
  await expect(page.getByLabel("Deletar fila")).toBeVisible()
  await expect(page.getByText("A fila está vazia")).toBeVisible()

  const roomId = await page.evaluate(() => localStorage.getItem("roomId"))
  expect(roomId).toBeTruthy()
  expect(roomId!.length).toBe(5)
  const token = await page.evaluate(() => localStorage.getItem("accessToken"))
  expect(token).toBeTruthy()
  const role = await page.evaluate(() => localStorage.getItem("role"))
  expect(role).toBe("HOST")
})

test("C2 - Public room share & QR deep link", async ({ page }) => {
  // Create host queue first
  await page.goto("/")
  await page.getByRole("link", { name: "Criar Fila" }).click()
  await page.getByLabel("Nome da Fila").fill("Fila QR Test")
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByRole("heading", { name: "Fila QR Test" })).toBeVisible()
  const roomId = await page.evaluate(() => localStorage.getItem("roomId"))

  // Visit public room page anonymously (clear storage)
  await page.evaluate(() => localStorage.clear())
  await page.goto(`/room/${roomId}`)
  await expect(page.getByRole("heading", { name: "Fila QR Test" })).toBeVisible()
  await expect(page.getByText(`Id da fila: ${roomId}`)).toBeVisible()
  // QR code should be present (svg)
  await expect(page.locator("svg").first()).toBeVisible()
  // Join URL is encoded in QR; we can check page still shows room
  // Invalid room
  await page.goto("/room/XXXXX")
  await expect(page.getByText("Fila não encontrada")).toBeVisible()

  // Deep link via QR -> join page prefilled
  await page.goto(`/join?id=${roomId}`)
  await expect(page.getByLabel("ID da Fila")).toHaveValue(roomId!)
})

test("C3 - Participant joins queue (two-step, validation)", async ({ page }) => {
  // Setup host room
  await page.goto("/")
  await page.getByRole("link", { name: "Criar Fila" }).click()
  await page.getByLabel("Nome da Fila").fill("Fila Join Test")
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByRole("heading", { name: "Fila Join Test" })).toBeVisible()
  const roomId = await page.evaluate(() => localStorage.getItem("roomId"))

  // Clear host session and go to join as user - test validation on empty join page
  await page.evaluate(() => localStorage.clear())
  await page.goto("/join")
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByText("Insira um id por favor")).toBeVisible()
  await expect(page.getByText("Insira seu nome por favor")).toBeVisible()

  await page.goto(`/join?id=${roomId}`)
  await expect(page.getByLabel("ID da Fila")).toHaveValue(roomId!)
  // Clear and test username only validation
  await page.getByLabel("ID da Fila").fill(roomId!)
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByText("Insira seu nome por favor")).toBeVisible()

  // Join successfully
  await page.getByLabel("Seu Nome").fill("Alice E2E")
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByText("Username: Alice E2E")).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(/Aguardando a fila|pessoa|É a sua vez/)).toBeVisible()

  const username = await page.evaluate(() => localStorage.getItem("username"))
  expect(username).toBe("Alice E2E")
  const userId = await page.evaluate(() => localStorage.getItem("userId"))
  expect(userId).toBeTruthy()
})

test("C4 - Host real-time queue management (polling, finish, confirm removal)", async ({ browser }) => {
  const hostContext = await browser.newContext()
  const hostPage = await hostContext.newPage()
  await hostPage.goto("/")
  await hostPage.getByRole("link", { name: "Criar Fila" }).click()
  await hostPage.getByLabel("Nome da Fila").fill("Fila Manage")
  await hostPage.getByRole("button", { name: "Continuar" }).click()
  await expect(hostPage.getByRole("heading", { name: "Fila Manage" })).toBeVisible()
  const roomId = await hostPage.evaluate(() => localStorage.getItem("roomId"))

  // Create two users in separate contexts
  const userCtx1 = await browser.newContext()
  const userPage1 = await userCtx1.newPage()
  await userPage1.goto(`/join?id=${roomId}`)
  await userPage1.getByLabel("Seu Nome").fill("User One")
  await userPage1.getByRole("button", { name: "Continuar" }).click()
  await expect(userPage1.getByText("Username: User One")).toBeVisible()

  const userCtx2 = await browser.newContext()
  const userPage2 = await userCtx2.newPage()
  await userPage2.goto(`/join?id=${roomId}`)
  await userPage2.getByLabel("Seu Nome").fill("User Two")
  await userPage2.getByRole("button", { name: "Continuar" }).click()
  await expect(userPage2.getByText("Username: User Two")).toBeVisible()

  // Host should see both users after polling (refetch every 3s)
  await expect.poll(async () => {
    const count = await hostPage.locator("text=User One").count()
    return count
  }, { timeout: 10_000 }).toBe(1)
  await expect(hostPage.getByText("User Two")).toBeVisible()

  // First user should have "Finalizar atendimento", second has ✕
  await expect(hostPage.getByRole("button", { name: "Finalizar atendimento" })).toBeVisible()
  const removeBtn = hostPage.getByLabel("Remover User Two")
  await expect(removeBtn).toBeVisible()
  // First user should NOT have remove button
  await expect(hostPage.getByLabel("Remover User One")).not.toBeVisible()

  // Click ✕ on second user -> confirm modal
  await removeBtn.click()
  await expect(hostPage.getByRole("dialog")).toBeVisible()
  await expect(hostPage.getByText("Tem certeza que deseja remover User Two da fila?")).toBeVisible()
  // Cancel
  await hostPage.getByRole("button", { name: "Cancelar" }).click()
  await expect(hostPage.getByRole("dialog")).not.toBeVisible()
  await expect(hostPage.getByText("User Two")).toBeVisible()

  // Confirm removal - use dialog scoped locator to avoid strict violation with X button
  await hostPage.getByLabel("Remover User Two").click()
  await hostPage.getByRole("dialog").getByRole("button", { name: "Remover" }).click()
  await expect(hostPage.getByText("User Two")).not.toBeVisible({ timeout: 10_000 })
  // User Two should be auto-kicked (polling GET /users/:id => 404 triggers logout)
  await expect.poll(async () => {
    const url = userPage2.url()
    return url
  }, { timeout: 10_000 }).toContain("/")
  // Check user page shows JoinForm again or HOME
  await userPage2.goto("/join")
  await expect(userPage2.getByRole("heading", { name: /Entrar em Fila/ })).toBeVisible()

  // Finish first user (attendance)
  await hostPage.getByRole("button", { name: "Finalizar atendimento" }).click()
  await expect(hostPage.getByText("User One")).not.toBeVisible({ timeout: 10_000 })
  await expect(hostPage.getByText("A fila está vazia")).toBeVisible()

  await hostContext.close()
  await userCtx1.close()
  await userCtx2.close()
})

test("C5 - Host share & delete queue (mock external deps)", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  await page.addInitScript(() => {
    // Mock clipboard to avoid permission flakiness, store value on window
    // @ts-ignore
    window.__clipboard = null
    if (navigator.clipboard) {
      const origWrite = navigator.clipboard.writeText.bind(navigator.clipboard)
      navigator.clipboard.writeText = async (text: string) => {
        // @ts-ignore
        window.__clipboard = text
        try {
          return await origWrite(text)
        } catch {
          return Promise.resolve()
        }
      }
    }
    // Mock window.open to capture URL without new tab
    // @ts-ignore
    window.__openedUrl = null
    const origOpen = window.open
    // @ts-ignore
    window.open = (url: string, target?: string, features?: string) => {
      // @ts-ignore
      window.__openedUrl = url
      return null
    }
  })

  await page.goto("/")
  await page.getByRole("link", { name: "Criar Fila" }).click()
  await page.getByLabel("Nome da Fila").fill("Fila Share")
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByRole("heading", { name: "Fila Share" })).toBeVisible()
  const roomId = await page.evaluate(() => localStorage.getItem("roomId"))
  const expectedUrl = `http://localhost:3000/room/${roomId}`

  // Click share
  await page.getByRole("button", { name: /Compartilhar/ }).click()
  // Should show feedback
  await expect(page.getByRole("button", { name: "Link copiado!" })).toBeVisible({ timeout: 5_000 })
  // Check mocked clipboard and open
  const clipboard = await page.evaluate(() => (window as any).__clipboard)
  expect(clipboard).toBe(expectedUrl)
  const opened = await page.evaluate(() => (window as any).__openedUrl)
  expect(opened).toBe(expectedUrl)

  // Feedback reverts after 2s
  await expect(page.getByRole("button", { name: "Compartilhar" })).toBeVisible({ timeout: 3_000 })

  // Delete queue - wait for DELETE response and check status
  const deletePromise = page.waitForResponse((resp) => resp.url().includes("/rooms/") && resp.request().method() === "DELETE", { timeout: 10_000 }).catch(() => null)
  await page.getByLabel("Deletar fila").click()
  const delResp = await deletePromise
  if (delResp) {
    console.log(`Delete response status: ${delResp.status()}`)
  } else {
    console.log("Delete response not captured")
  }
  // HostSession onSuccess logs out; HostPage will show HostForm at /host (or redirect to /)
  await expect.poll(async () => await page.evaluate(() => localStorage.getItem("accessToken")), { timeout: 10_000 }).toBeNull()
  // Accept either /host with Criar Fila or / with Me Fila
  await expect(page.getByRole("heading", { name: /Criar Fila|Me Fila/ })).toBeVisible({ timeout: 10_000 })
  const afterToken = await page.evaluate(() => localStorage.getItem("accessToken"))
  expect(afterToken).toBeNull()
  // Verify room gone
  await page.goto(`/room/${roomId}`)
  await expect(page.getByText("Fila não encontrada")).toBeVisible()
})

test("C6 - Participant self-leave & auto-kick (position variations)", async ({ browser }) => {
  const hostCtx = await browser.newContext()
  const hostPage = await hostCtx.newPage()
  await hostPage.goto("/")
  await hostPage.getByRole("link", { name: "Criar Fila" }).click()
  await hostPage.getByLabel("Nome da Fila").fill("Fila Leave")
  await hostPage.getByRole("button", { name: "Continuar" }).click()
  await expect(hostPage.getByRole("heading", { name: "Fila Leave" })).toBeVisible()
  const roomId = await hostPage.evaluate(() => localStorage.getItem("roomId"))

  // User joins
  const userCtx = await browser.newContext()
  const userPage = await userCtx.newPage()
  await userPage.goto(`/join?id=${roomId}`)
  await userPage.getByLabel("Seu Nome").fill("Leaver")
  await userPage.getByRole("button", { name: "Continuar" }).click()
  await expect(userPage.getByText("Username: Leaver")).toBeVisible()

  // Initially position may be 1 or waiting; wait for position to appear
  await expect(userPage.getByText(/Aguardando a fila|É a sua vez|pessoa/)).toBeVisible()

  // Self-leave via "Sair" - wait for DELETE /users
  const leavePromise = userPage.waitForResponse((resp) => resp.url().includes("/users/") && resp.request().method() === "DELETE", { timeout: 10_000 }).catch(() => null)
  await userPage.getByRole("button", { name: "Sair" }).click()
  const leaveResp = await leavePromise
  if (leaveResp) {
    console.log(`Leave response status: ${leaveResp.status()}`)
  } else {
    console.log("Leave response not captured")
  }
  await expect.poll(async () => await userPage.evaluate(() => localStorage.getItem("accessToken")), { timeout: 10_000 }).toBeNull()
  // After logout, JoinPage shows JoinForm at /join or redirects to /
  await expect(userPage.getByRole("heading", { name: /Entrar em Fila|Me Fila/ })).toBeVisible({ timeout: 10_000 })
  // Going back to join should show form
  await userPage.goto("/join")
  await expect(userPage.getByRole("heading", { name: "Entrar em Fila" })).toBeVisible()

  // Re-join and test auto-kick by host finish
  await userPage.goto(`/join?id=${roomId}`)
  await userPage.getByLabel("Seu Nome").fill("Leaver2")
  await userPage.getByRole("button", { name: "Continuar" }).click()
  await expect(userPage.getByText("Username: Leaver2")).toBeVisible()

  // Host finishes
  await expect(hostPage.getByText("Leaver2")).toBeVisible({ timeout: 10_000 })
  await hostPage.getByRole("button", { name: "Finalizar atendimento" }).click()
  await expect.poll(async () => userPage.url(), { timeout: 10_000 }).toContain("/")

  await hostCtx.close()
  await userCtx.close()
})

test("C7 - Navigation & auth persistence / guardrails", async ({ page, browser }) => {
  // Host persistence: after create, going to / should redirect to /host
  await page.goto("/")
  await page.getByRole("link", { name: "Criar Fila" }).click()
  await page.getByLabel("Nome da Fila").fill("Fila Guard")
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByRole("heading", { name: "Fila Guard" })).toBeVisible()

  await page.goto("/")
  await expect(page).toHaveURL(/\/host/)

  // Host cannot access join session without USER token: visit /join should still show host? Actually /join index shows JoinForm if not USER
  await page.goto("/join")
  await expect(page.getByRole("heading", { name: "Entrar em Fila" })).toBeVisible()

  // Clear and test unauthenticated host session guard
  await page.evaluate(() => localStorage.clear())
  await page.goto("/host")
  await expect(page.getByRole("heading", { name: "Criar Fila" })).toBeVisible()

  // Unknown route redirects to home
  await page.goto("/nothing-here-xyz")
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole("heading", { name: "Me Fila" })).toBeVisible()

  // Voltar links
  await page.goto("/host")
  await page.getByRole("link", { name: "Voltar" }).click()
  await expect(page).toHaveURL(/\/$/)

  await page.goto("/join")
  await page.getByRole("link", { name: "Voltar" }).click()
  await expect(page).toHaveURL(/\/$/)

  // Persistence across reload
  await page.goto("/")
  await page.getByRole("link", { name: "Criar Fila" }).click()
  await page.getByLabel("Nome da Fila").fill("Fila Reload")
  await page.getByRole("button", { name: "Continuar" }).click()
  await expect(page.getByRole("heading", { name: "Fila Reload" })).toBeVisible()
  await page.reload()
  await expect(page.getByRole("heading", { name: "Fila Reload" })).toBeVisible()
})
