import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.send("Hello World");
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`[server]: Server is running port ${port}`);
});
