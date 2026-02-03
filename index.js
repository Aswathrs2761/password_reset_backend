import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Database/dbConfig.js";
import authRoute from "./Routes/authRoute.js"



dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())


connectDB()

app.get("/", (req, res) => {
    res.send("Welcome to backend")
})

app.use("/api/auth", authRoute)

const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server started at port ${port}`)
})