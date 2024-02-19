import {Router, Request, Response} from "express";
import Hotel, { BookingType } from "../models/hotel";
import { HotelSearchResponse } from "../shared/hotelSearchResponse";
import { param, validationResult } from "express-validator";
import verifyToken from "../middleware/authenticate";

const router = Router();


// utility function
const constructSearchQuery = (queryParams: any) => {
    let constructedQuery: any = {};

    if (queryParams.destination) {
        constructedQuery.$or = [
            {city: new RegExp(queryParams.destination, "i")},
            {country: new RegExp(queryParams.destination, "i")}
        ]
    }

    if (queryParams.adultCount) {
        constructedQuery.adultCount = {
            $gte: parseInt(queryParams.adultCount)
        }
    }

    if (queryParams.childCount) {
        constructedQuery.childCount = {
            $gte: parseInt(queryParams.childCount)
        }
    }

    if (queryParams.facilities) {
        constructedQuery.facilities = {
            $all: Array.isArray(queryParams.facilities) ? queryParams.facilities : [queryParams.facilities]
        }
    }

    if (queryParams.types) {
        constructedQuery.type = {
            $in: Array.isArray(queryParams.types) ? queryParams.types : [queryParams.types]
        }
    }

    if (queryParams.stars) {
        const starRating = Array.isArray(queryParams.stars)
                                ? queryParams.stars.map((star: string) => parseInt(star)) 
                                : parseInt(queryParams.stars)

        constructedQuery.starRating = Array.isArray(starRating)
                                ? { $in: starRating }
                                : { $eq: starRating };
    }

    if (queryParams.maxPrice) {
        constructedQuery.pricePerNight = {
            $lte: parseInt(queryParams.maxPrice).toString()
        }
    }

    return constructedQuery;
}

router.get('/search', async (req: Request, res: Response) => {
    try {
        const query = constructSearchQuery(req.query);
        let sortOptions = {};
        switch(req.query.sortOptions) {
            case "starRating":
                sortOptions = {starRating: -1}
                break;
            case "pricePerNightAsc":
                sortOptions = {pricePerNight: 1}
                break;
            case "pricePerNightDesc":
                sortOptions = {pricePerNight: -1}
                break;
        }
        const pageSize = 5;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
        const skip = (pageNumber - 1) * pageSize;
        const hotels = await Hotel.find(query).sort(sortOptions).skip(skip).limit(pageSize);
        const total = await Hotel.countDocuments(query);

        const response: HotelSearchResponse = {
            data: hotels,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / pageSize)
            }
        }

        return res.status(200).json({
            message: "success",
            response
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.get('/:Id', [
    param("Id").notEmpty().withMessage("Hotel Id is required")
] ,async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({message: errors.array()});
    };

    const Id = req.params.Id;

    try {
        const hotel = await Hotel.findById(Id);

        return res.status(200).json(hotel);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
});


router.post("/:Id/bookings/payment-intent", verifyToken, async (req: Request, res: Response) => {
    const {numberOfNights} = req.body;
    const hotelId = req.params.Id;

    const hotel = await Hotel.findById(hotelId);

    if (!hotel) {
        return res.status(400).json({
            message: "Hotel not found"
        })
    };

    const totalCost = hotel.pricePerNight * numberOfNights;

    const response  = {
        paymentIntentId: "Aolo"+ Math.floor(Math.random() * 1000),
        clientId: "Aolo" + Math.floor(Math.random() * 1000),
        totalCost
    }

    return res.status(200).send(response);
});

router.post("/:Id/bookings", verifyToken, async (req: Request, res: Response) => {
    try {
        const paymentIntentId = req.body.paymentIntentId;

        if (!paymentIntentId) {
            return res.status(400).json({message: "payment not found"})
        };

       const newBooking: BookingType = {
        ...req.body,
        userId: req.userId
       };

       const hotel = await Hotel.findOneAndUpdate({_id: req.params.Id}, {
        $push: {booking: newBooking}
       }, {new: true});

       

       if (!hotel) {
        return res.status(400).json({
            message: "hotel not found"
        });
       };

       await hotel.save();
       return res.status(200).json({
        message: "Successful"
       })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export default router;