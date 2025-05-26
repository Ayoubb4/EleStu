import { Schema } from 'mongoose'

export const UserSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
})
