import {Router, Request, Response} from "express";
import multer from "multer";
import {v2 as cloudinary} from "cloudinary";
import Hotel, { HotelType } from "../models/hotel";
import User from "../models/user";
import verifyToken from "../middleware/authenticate";
import { ExpressValidator, body } from "express-validator";

const router = Router();


const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})

// api/my-hotels
router.post('/', verifyToken, [
    body("name").notEmpty().withMessage("Name is required"),
    body("city").notEmpty().withMessage("city is required"),
    body("country").notEmpty().withMessage("country is required"),
    body("description").notEmpty().withMessage("description is required"),
    body("type").notEmpty().withMessage("type is required"),
    body("pricePerNight").notEmpty().isNumeric().withMessage("price is required"),
    body("facilities").notEmpty().isArray().withMessage("facilities are required"),
] ,upload.array("imageFile", 6), async (req: Request, res: Response) => {
    try {
        const imageFile = req.files as Express.Multer.File[];
        const newHotel: HotelType = req.body;

        const userId = req.userId
        const user = await User.findById(userId);
        if (!user) return res.status(401).json({
            message: 'Request not found'
        })

        // 1. upload to cloudinary
        const imageUrls = await uploadImages(imageFile);

        newHotel.imageUrls = imageUrls;
        newHotel.lastUpdated = new Date();
        newHotel.userId = user._id;
        // 2. if upload was successful, add URLs to the new hotel

        // 3. save the new hotel in our database
        const hotel = new Hotel(newHotel);
        await hotel.save();

        // 4. return a 201 status
        res.status(201).json({
            message: "success",
            data: hotel
        })

    } catch (error) {
        console.log("Error: ",error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
});

router.get('/', verifyToken, async (req: Request, res: Response) => {

try {
const hotels = await Hotel.find({userId: req.userId});

return res.status(200).json(hotels)    
} catch (error) {
    console.log(error);
    return res.status(500).json({message: "internal server error"})
}
});

router.get("/:Id", verifyToken, async(req: Request, res: Response) => {
    const {Id} = req.params;

    try {
        const hotel = await Hotel.findOne({
            _id: Id,
            userId: req.userId
        });

        return res.status(200).json(hotel);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error"
        })
    }
});


router.put("/:Id", verifyToken, upload.array("imageFile"),async(req: Request, res: Response) => {
    try {
        const updatedHotel: HotelType = req.body;
        updatedHotel.lastUpdated = new Date();

        const hotel = await Hotel.findOneAndUpdate({
            _id: req.params.Id,
            userId: req.userId
        }, updatedHotel, {new: true});

        if (!hotel) {
            return res.status(404).json({
                message: "Hotel not found"
            });
        }

        const files = req.files as Express.Multer.File[];
        const updatedImages = await uploadImages(files);

        hotel.imageUrls = [...updatedImages, ...(updatedHotel.imageUrls || [])];

        await hotel.save();

        return res.status(200).json({
            message: "Updated was successful",
            hotel
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error"
        })
    }
})


async function uploadImages(imageFile: Express.Multer.File[]) {
    const uploadPromises = imageFile.map(async (image) => {
        const b64 = Buffer.from(image.buffer).toString("base64");

        let dataUrl = "data:" + image.mimetype + ";base64," + b64;
        const res = await cloudinary.uploader.upload(dataUrl);
        return res.url;
    });

    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
}


export default router;