import { Schema } from 'mongoose'

export const StudioSchema = new Schema({
    name: String,
    address: String,
    location: {
        lat: Number,
        lng: Number
    },
    mapsPlaceId: String
})
