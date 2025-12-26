import mongoose from "mongoose";

const { Schema } = mongoose

const companySchema = new Schema({
    companyName: {
        type: String,
        required: [true,"Company name is required"],
        trim: true,
    },

    email: {
        type: String,
        required: [true,"Company email is required"],
        trim: true,
    },
    password: {
        type: String,
        required: [true,"Password is required"],
        trim: true,
        select:false,
    },
    registrationNumber: {type:String},// e.g., CIPC number for SA companies

    contactNumber: { type: String, required:[true,"Enter your business contact number"]},

    isProfileComplete: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default:false,
    },

    rooms: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
        }
    ],

    notifications: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
        }
    ],
    streetNumber: {
        type:String
    },
    streetName:{
        type:String
    },
    city: {
        type:String
    },
    country: {
        type:String
    },
    website: {
        type: String
    },
    operatingHours: {
        type: String,
        default:'24/7'
    }

}, { timestamps: true, strict:'throw'})

const Company = mongoose.model('Company', companySchema)

export {Company}
