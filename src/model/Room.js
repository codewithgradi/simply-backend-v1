import mongoose from "mongoose";
import { number } from "zod";

const { Schema } = mongoose

const RoomSchema = new Schema({
    companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index:true,
        },
    roomNumber: {
        type: String,
        required: true
    },
    floor: String,
  
    type: {
        type: String,
        enum: ['Suite', 'Standard', 'Conference'],
        default: 'Standard'
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Maintenance'],
        default: 'Available'
    },
    numberOfTimesBooked: {
        type: Number,
        default:0,
    }
}, { timestamps: true })



const Room = mongoose.model('Room', RoomSchema)

export  {Room}