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
const hotel_1 = __importDefault(require("../models/hotel"));
const express_validator_1 = require("express-validator");
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const router = (0, express_1.Router)();
// utility function
const constructSearchQuery = (queryParams) => {
    let constructedQuery = {};
    if (queryParams.destination) {
        constructedQuery.$or = [
            { city: new RegExp(queryParams.destination, "i") },
            { country: new RegExp(queryParams.destination, "i") }
        ];
    }
    if (queryParams.adultCount) {
        constructedQuery.adultCount = {
            $gte: parseInt(queryParams.adultCount)
        };
    }
    if (queryParams.childCount) {
        constructedQuery.childCount = {
            $gte: parseInt(queryParams.childCount)
        };
    }
    if (queryParams.facilities) {
        constructedQuery.facilities = {
            $all: Array.isArray(queryParams.facilities) ? queryParams.facilities : [queryParams.facilities]
        };
    }
    if (queryParams.types) {
        constructedQuery.type = {
            $in: Array.isArray(queryParams.types) ? queryParams.types : [queryParams.types]
        };
    }
    if (queryParams.stars) {
        const starRating = Array.isArray(queryParams.stars)
            ? queryParams.stars.map((star) => parseInt(star))
            : parseInt(queryParams.stars);
        constructedQuery.starRating = Array.isArray(starRating)
            ? { $in: starRating }
            : { $eq: starRating };
    }
    if (queryParams.maxPrice) {
        constructedQuery.pricePerNight = {
            $lte: parseInt(queryParams.maxPrice).toString()
        };
    }
    return constructedQuery;
};
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = constructSearchQuery(req.query);
        let sortOptions = {};
        switch (req.query.sortOptions) {
            case "starRating":
                sortOptions = { starRating: -1 };
                break;
            case "pricePerNightAsc":
                sortOptions = { pricePerNight: 1 };
                break;
            case "pricePerNightDesc":
                sortOptions = { pricePerNight: -1 };
                break;
        }
        const pageSize = 5;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
        const skip = (pageNumber - 1) * pageSize;
        const hotels = yield hotel_1.default.find(query).sort(sortOptions).skip(skip).limit(pageSize);
        const total = yield hotel_1.default.countDocuments(query);
        const response = {
            data: hotels,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / pageSize)
            }
        };
        return res.status(200).json({
            message: "success",
            response
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.get('/:Id', [
    (0, express_validator_1.param)("Id").notEmpty().withMessage("Hotel Id is required")
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    ;
    const Id = req.params.Id;
    try {
        const hotel = yield hotel_1.default.findById(Id);
        return res.status(200).json(hotel);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.post("/:Id/bookings/payment-intent", authenticate_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { numberOfNights } = req.body;
    const hotelId = req.params.Id;
    const hotel = yield hotel_1.default.findById(hotelId);
    if (!hotel) {
        return res.status(400).json({
            message: "Hotel not found"
        });
    }
    ;
    const totalCost = hotel.pricePerNight * numberOfNights;
    const response = {
        paymentIntentId: "Aolo" + Math.floor(Math.random() * 1000),
        clientId: "Aolo" + Math.floor(Math.random() * 1000),
        totalCost
    };
    return res.status(200).send(response);
}));
router.post("/:Id/bookings", authenticate_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentIntentId = req.body.paymentIntentId;
        if (!paymentIntentId) {
            return res.status(400).json({ message: "payment not found" });
        }
        ;
        const newBooking = Object.assign(Object.assign({}, req.body), { userId: req.userId });
        const hotel = yield hotel_1.default.findOneAndUpdate({ _id: req.params.Id }, {
            $push: { booking: newBooking }
        }, { new: true });
        if (!hotel) {
            return res.status(400).json({
                message: "hotel not found"
            });
        }
        ;
        yield hotel.save();
        return res.status(200).json({
            message: "Successful"
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}));
exports.default = router;
//# sourceMappingURL=hotels.js.map