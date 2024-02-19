import { HotelType } from "../models/hotel"

export type HotelSearchResponse = {
    data: HotelType[],
    pagination: {
        total: number,
        page: number,
        pages: number
    }
}


export type PaymentResponse = {
    paymentIntentId: string,
    clientId: string,
    totalCost: number
}