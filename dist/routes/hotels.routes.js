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
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const hotel_1 = __importDefault(require("../models/hotel"));
const user_1 = __importDefault(require("../models/user"));
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});
// api/my-hotels
router.post('/', authenticate_1.default, [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("city").notEmpty().withMessage("city is required"),
    (0, express_validator_1.body)("country").notEmpty().withMessage("country is required"),
    (0, express_validator_1.body)("description").notEmpty().withMessage("description is required"),
    (0, express_validator_1.body)("type").notEmpty().withMessage("type is required"),
    (0, express_validator_1.body)("pricePerNight").notEmpty().isNumeric().withMessage("price is required"),
    (0, express_validator_1.body)("facilities").notEmpty().isArray().withMessage("facilities are required"),
], upload.array("imageFile", 6), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imageFile = req.files;
        const newHotel = req.body;
        const userId = req.userId;
        const user = yield user_1.default.findById(userId);
        if (!user)
            return res.status(401).json({
                message: 'Request not found'
            });
        // 1. upload to cloudinary
        const uploadPromises = imageFile.map((image) => __awaiter(void 0, void 0, void 0, function* () {
            const b64 = Buffer.from(image.buffer).toString("base64");
            let dataUrl = "data:" + image.mimetype + ";base64," + b64;
            const res = yield cloudinary_1.v2.uploader.upload(dataUrl);
            return res.url;
        }));
        const imageUrls = yield Promise.all(uploadPromises);
        newHotel.imageUrls = imageUrls;
        newHotel.lastUpdated = new Date();
        newHotel.userId = user._id;
        // 2. if upload was successful, add URLs to the new hotel
        // 3. save the new hotel in our database
        const hotel = new hotel_1.default(newHotel);
        yield hotel.save();
        // 4. return a 201 status
        res.status(201).json({
            message: "success",
            data: hotel
        });
    }
    catch (error) {
        console.log("Error: ", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.get('/', authenticate_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotels = yield hotel_1.default.find({ userId: req.userId });
        return res.status(200).json(hotels);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "internal server error" });
    }
}));
exports.default = router;
//# sourceMappingURL=hotels.routes.js.map