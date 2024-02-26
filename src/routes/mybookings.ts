import {Router, Request, Response} from "express";
import verifyToken from "../middleware/authenticate";
import Hotel, { HotelType } from "../models/hotel";

const router = Router();


router.get("", verifyToken, async(req, res) => {
    try {
        const hotels = await Hotel.find({
            booking: {
                $elemMatch: { userId: req.userId }
            }
        });

        console.log(hotels);

        const result = hotels.map((hotel) => {
            const userBook = hotel.booking.filter((booking) => booking.userId === req.userId)

            const hotelWithUserBooking = {
                ...hotel.toObject(),
                booking: userBook
            };

            return hotelWithUserBooking;
        });

        return res.status(200).json(hotels);
    } catch (error) {
        console.error("Error fetching hotels with user bookings:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});






export default router;