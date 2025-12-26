import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
    adminId: String,
    action: String,
    targetId: String,
    timestamp: { type: Date, default: Date.now },
    details : Object
})

const Log = mongoose.model('Log',logSchema)

export {Log}