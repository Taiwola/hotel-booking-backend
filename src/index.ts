import express, { urlencoded } from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import cookie from "cookie-parser";


try {
    mongoose.set('strictQuery', true)
    mongoose.connect(process.env.MONGO_URL as string);
    console.log('Connected to db');
} catch(error) {
    console.log(error);
    throw new Error("mongodb connection error")
}

const app = express();
const PORT =  process.env.PORT || 3200;

app.use(express.json());
app.use(urlencoded({extended: true}));
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use(cookie());


import userRoutes from "./routes/users.route";
import authRoutes from "./routes/auth.routes"

app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes)





app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})