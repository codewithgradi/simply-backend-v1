import {Visitor} from '../model/Visitor.js'
import crypto from 'crypto'
import { nanoid } from 'nanoid';
import { Room } from '../model/Room.js';
import { Notification } from '../model/Notification.js'
import { sendVisitorEmail } from '../utils/emailService.js';

//VISTOR CHECK IN LOGIC
const checkIn = async (req, res) => {
    
    // 1. Destructure roomNumber out, and put everything else in 'otherData'
    const { idNumber,
        firstName,
        lastName,
        email,
        phoneNumber,
        companyId,
        roomNumber,
        ...otherData } = req.body;
    
    if (!companyId) {
        return res.status(412).json({ 
            success: false, 
            message: 'Business ID is required for check-in.' 
        });
    }

    const hashedIdNumber = crypto.createHash('sha256').update(idNumber).digest('hex');

    try {
        const existing = await Visitor.findOne({
            idNumber: hashedIdNumber,
            status: "checked-in",
            companyId: companyId,
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check in again. You need to check out first.'
            });
        }

        const room = await Room.findOne({ roomNumber, companyId });
        if (!room) {
            return res.status(404).json({
                success: false,
                message: `Room ${roomNumber} could not be found for this business.`
            });
        }
        const notRoomAvailable = await Room.findOne({ roomNumber, companyId, status: 'Occupied' })
        
        if (notRoomAvailable) return res.status(403).json({ success: false, message: 'Room is occupied' })
        
        const passCode = nanoid(20);

        const visitorData = { 
            ...otherData, 
            firstName,
            lastName,
            phoneNumber,
            email,
            companyId,
            roomId: room._id,
            passCode, 
            idNumber: hashedIdNumber,
            status: "checked-in" 
        };

        const visitor = await Visitor.create(visitorData);

        // 3. Update Room Status
        await Room.findByIdAndUpdate(room._id,
            {
                $set: { status: 'Occupied' },
                $inc:{numberOfTimesBooked:1}
            },
            {new:true}
        );

        // 4. Create Notification
        await Notification.create({
            visitorName: `${firstName} ${lastName}`,
            companyId,
            isRead: false
        });

       sendVisitorEmail(email, firstName, roomNumber, passCode);

        res.status(201).json({
            success: true,
            data: visitor,
            message: 'Pass sent to your email'
        });

    } catch (error) {
        console.error("Check-in Error:", error);
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};
/// VISITOR CHECK OUT LOGIC
const checkOut = async (req, res) => {
    try {
        const { passCode } = req.body; 
        const tenantId = req.tenantId; 

        // 1. Validation check
        if (!passCode) {
            return res.status(400).json({ success: false, message: "Passcode is required." });
        }

        // 2. Atomic Update
        const visitor = await Visitor.findOneAndUpdate(
            { 
                passCode, 
                companyId: tenantId, 
                status: 'checked-in' 
            },
            { 
                $set: { 
                    status: 'checked-out', 
                    checkOutTime: new Date() 
                } 
            },
            { new: true } // Returns the updated document
        );

        if (!visitor) {
            return res.status(404).json({ 
                success: false, 
                message: "Valid active visitor not found for this code." 
            });
        }

        res.status(200).json({
            success: true,
            message: `Checked out: ${visitor.firstName} ${visitor.lastName}`,
            exitTime: visitor.exitTime
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};

export {checkIn,checkOut}