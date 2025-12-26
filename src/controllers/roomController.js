import { Company } from '../model/Company.js';
import {Room} from '../model/Room.js'
import { Visitor } from '../model/Visitor.js';

const createRoom = async (req, res) => {
    const { companyId, roomNumber } = req.body;

    // 1. Validation for Business ID
    if (!companyId) {
        return res.status(412).json({ 
            success: false, 
            message: 'Business ID is required to create a room.' 
        });
    }

    try {
        // 2. Check if the room already exists FOR THIS specific company
        // Note: MongoDB method is .exists() - not .exits()
        const roomExists = await Room.exists({ roomNumber, companyId });  
        
        if (roomExists) {
            return res.status(409).json({ // 409 is the standard for Conflict
                success: false, 
                message: `Room number ${roomNumber} already exists for your hotel.` 
            });   
        }

        // 3. Create the Room
        const newRoom = await Room.create({ ...req.body });

        // 4. Update the Company's rooms array (The Relationship)
        await Company.findByIdAndUpdate(companyId, {
            $push: { rooms: newRoom._id }
        });

        // 5. Success Response
        return res.status(201).json({
            success: true,
            message: "Room created and linked to your hotel successfully.",
            data: newRoom,
        });
        
    } catch (err) {
        // 6. Handle Mongoose Duplicate Key Error (11000)
        if (err.code === 11000) {
            return res.status(400).json({ 
                success: false,
                message: `${Object.keys(err.keyValue)} already exists.` 
            });
        }

        // 7. General Error Handling
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to create room. Please try again later.' 
        });
    }
}
const updateRoomDetails = async (req, res) => {
    try {
        const companyId = req.user?.tenantId || req.user?._id;
        
        const { roomId } = req.params; 
        const updates = req.body;

        
        const updatedRoom = await Room.findOneAndUpdate(
            { _id: roomId, companyId: companyId }, 
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedRoom) {
            return res.status(404).json({ 
                success: false, 
                message: "Room not found or you don't have permission to edit it." 
            });
        }

        res.status(200).json({
            success: true,
            message: "Room updated successfully",
            data: updatedRoom
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Update failed",
            error: error.message
        });
    }
}
const deleteOneRoom = async (req, res) => {
    try {
        // 1. Get the Room ID from URL and Company ID from token
        const { roomId } = req.params;
        const companyId = req.user?.tenantId || req.user?._id;

        // 2. Find and Delete the room
        // We verify companyId here to ensure Hotel A can't delete Hotel B's rooms
        const deletedRoom = await Room.findOneAndDelete({ 
            _id: roomId, 
            companyId: companyId 
        });

        if (!deletedRoom) {
            return res.status(404).json({ 
                success: false, 
                message: "Room not found or unauthorized access." 
            });
        }

        // 3. REMOVE the ID from the Company's 'rooms' array
        await Company.findByIdAndUpdate(companyId, {
            $pull: { rooms: roomId }
        });

        res.status(200).json({
            success: true,
            message: "Room deleted and removed from company profile successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Deletion failed",
            error: error.message
        });
    }
};

const getAllRooms = async (req, res) => {
    try {
        // 1. Identify the company from the middleware (tenantId)
        const companyId = req.tenantId || req.user?.tenantId;

        
        const rooms = await Room.find({ companyId: companyId }).sort({ roomNumber: 1 });

        // 3. Handle Empty State
        // Corrected typo from .legth to .length
        if (rooms.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: 'No rooms registered for this business.',
                data: [] // Better to return an empty array than a 403 error
            });
        }

        // 4. Success Response
        return res.status(200).json({ 
            success: true, 
            count: rooms.length,
            data: rooms 
        });

    } catch (error) {
        // 5. Error Handling - Use 500 for server/database errors
        return res.status(500).json({ 
            success: false,
            message: `Error while reading database: ${error.message}` 
        });
    }
};
const getOneRoom = async (req, res) => {
    const {roomId} = req.params
    // 1. Correctly extract the tenantId (Company ID) from the request
    const companyId = req.tenantId || req.user?.tenantId;

    try {
        // 2. Find a room associated with this specific company
        const room = await Room.findOne({ companyId: companyId, _id:roomId });

        if (!room) {
            return res.status(404).json({ 
                success: false, 
                message: 'Room not found' 
            });
        }

        // 3. Return the room data
        res.status(200).json({ 
            success: true, 
            data: room 
        });

    } catch (error) {
        console.error("Fetch Room Error:", error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};

export {createRoom,deleteOneRoom,getAllRooms,getOneRoom,updateRoomDetails}