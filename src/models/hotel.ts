import mongoose from "mongoose";


export type BookingType = {
    _id: string,
    userId: mongoose.Schema.Types.ObjectId | string,
    firstName: string,
    lastName: string,
    email: string,
    childCount: number,
    adultCount: number,
    totalCost: number,
    checkIn: Date,
    checkOut: Date
}

const bookingSchema = new mongoose.Schema<BookingType>({
    userId: {type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, require: true},
    adultCount: {type: Number, required: true},
    childCount: {type: Number, required: true},
    checkIn: {type: Date, required: true},
    checkOut: {type: Date, required: true},
    totalCost: {type: Number, required: true}
})

export type HotelType = {
    _id: string,
    userId: mongoose.Schema.Types.ObjectId | string,
    name: string,
    country: string,
    description: string,
    type: string,
    city: string,
    adultCount: number,
    childCount: number,
    facilities: string[],
    pricePerNight: number,
    starRating: number,
    imageUrls: string[],
    lastUpdated: Date,
    booking: BookingType[]
};

const hotelSchema = new mongoose.Schema<HotelType>({
    userId: {type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'},
    name: {type: String, required: true},
    country: {type: String, required: true},
    description: {type: String, required: true},
    city: {type: String, required: true},
    type: {type: String, required: true},
    adultCount: {type: Number, required: true},
    childCount: {type: Number, required: true},
    facilities: [{type: String, required: true}],
    pricePerNight: {type: Number, required: true},
    starRating: {type: Number, required: true, min: 1, max: 5},
    imageUrls: [{type: String, required: true}],
    lastUpdated: {type: Date},
    booking: [bookingSchema]
});

const Hotel = mongoose.model<HotelType>("Hotel", hotelSchema);

export default Hotel;