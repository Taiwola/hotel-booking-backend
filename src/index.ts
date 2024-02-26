import "dotenv/config";
import express, { urlencoded } from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookie from "cookie-parser";
import path from "path";
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_KEY_SECRET
})

try {
    mongoose.set('strictQuery', true)
    mongoose.connect(process.env.MONGO_URL as string);
   console.log("ok")
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

app.use(express.static(path.join(__dirname, "../../frontend/dist")))


import userRoutes from "./routes/users.route";
import authRoutes from "./routes/auth.routes";
import hotelRoutes from "./routes/hotels.routes";
import hotelQueryRoutes from "./routes/hotels";
import hotelBookings from "./routes/mybookings";


app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/my-hotels", hotelRoutes);
app.use("/api/hotels", hotelQueryRoutes);
app.use("/api/my-bookings", hotelBookings);






app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})