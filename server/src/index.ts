import "dotenv/config"
import express, { Response } from "express"
import cors from "cors"
import { roomRoutes } from "./routes/roomRoutes"
import { ApiResponse } from "@me-fila/shared/types"
import { logger } from "./logger"
import { userRoutes } from "./routes/userRoutes"
import { errorHandler } from "./middleware/errorHandler"

const PORT = 5000
const app = express()
app.use(express.json())
app.use(cors())
app.use("/rooms", roomRoutes)
app.use("/users", userRoutes)

app.get("/", (_req, res: Response<ApiResponse<{ message: string }>>) => {
  res.json({
    data: { message: "Welcome to the Me Fila API. Check docs for how to use." },
    error: null,
  })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running port ${PORT}`)
})
