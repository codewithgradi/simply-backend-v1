import mongoose from "mongoose";

const { Schema } = mongoose

const visitorSchema = new Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index:true,
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true,
        index:true,
    },
    firstName: {
        type: String,
        required: [true, "Please add first name"],
        trim:true,
    },
    lastName: {
        type: String,
        required: [true, "Please add last name"],
        trim:true,
    },
    idNumber: {
        type: String,
        required: [true, "ID Number is required for security"],
        //remember to encrypt this
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone number is required"],
    },
    email: {
        type: String,
        required: [true, "Email number is required"],
    },
    reasonForVisit: {
        type: String,
        enum: ['Delivery', 'Meeting', 'Maintenance', 'Personal'],
        default:'Personal',
    },
    checkInTime: {
        type: Date,
        default:Date.now,
    },
    checkOutTime: {
        type:Date
    },
    status: {
        type: String,
        enum: ["checked-in", "checked-out"],
        default:"checked-in",
    },
    createdAt: {
        type: Date,
        default: Date.now,
        //Ensures user is deleted from database in 30 days to comply with POPIA
        expires: 2592000,
    },
    gender: {
        type: String,
        enum:["MALE","FEMALE","OTHER"],
    },
    passCode: {
        type: String,
        unique: true,
        requred:true,
    },
},
    //automatically adds 'updatedAt' fields
    {timestamps:true,strict:'throw'},
)

visitorSchema.index(
    { idNumber: 1, status: 1 },
    {unique:true,partialFilterExpression:{status:'ckecked-in'}}
)

const Visitor = mongoose.model('Visitor', visitorSchema)

export  {Visitor}