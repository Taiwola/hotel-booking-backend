"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const hotel_1 = __importDefault(require("../models/hotel"));
const router = (0, express_1.Router)();
router.get("", authenticate_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotels = yield hotel_1.default.find({
            booking: {
                $elemMatch: { userId: req.userId }
            }
        });
        console.log(hotels);
        const result = hotels.map((hotel) => {
            const userBook = hotel.booking.filter((booking) => booking.userId === req.userId);
            const hotelWithUserBooking = Object.assign(Object.assign({}, hotel.toObject()), { booking: userBook });
            return hotelWithUserBooking;
        });
        return res.status(200).json(hotels);
    }
    catch (error) {
        console.error("Error fetching hotels with user bookings:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}));
exports.default = router;
//# sourceMappingURL=mybookings.js.map