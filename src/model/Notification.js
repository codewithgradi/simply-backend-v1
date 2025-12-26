import mongoose from "mongoose";

const { Schema } = mongoose

const NotificationSchema = new Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index:true,
    },
    visitorName: {
        type: String,
        required: [true, "Please add first name"],
        trim:true,
    },
    isRead: {
        type: Boolean,
        default:false,
    },
    type: {
        type: String,
        enum:['check-in','check-out'],
        default:'check-in'
    },
    createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 172800 // 2 days 
  }
},
    //automatically adds 'updatedAt' fields
    {timestamps:true,strict:'throw'},
)



const Notification = mongoose.model('Notification', NotificationSchema)

export  {Notification}