import "dotenv/config"
import express from "express"
import cors from "cors"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { roomRoutes } from "./routes/roomRoutes"
import { userRoutes } from "./routes/userRoutes"
import { errorHandler } from "./middleware/errorHandler"

const PORT = process.env.PORT || 3000
const app = express()
app.use(express.json())
app.use(cors())
app.use("/rooms", roomRoutes)
app.use("/users", userRoutes)

// Serve the built client (produced by `npm run build`) from "/".
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const clientDir = path.join(__dirname, "../public")
if (fs.existsSync(path.join(clientDir, "index.html"))) {
  app.use(express.static(clientDir))
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDir, "index.html"))
  })
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server is running port ${PORT}`)
})
