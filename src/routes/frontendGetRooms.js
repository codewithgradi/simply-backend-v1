import express from 'express'
import { getAllRooms } from '../controllers/roomController.js'
import { setTenant } from '../middlewares/tenantMiddleware.js'
import { Room } from '../model/Room.js';


const getAllRoomsForFrontend = async (req, res) => {
    try {
        // 1. Identify the company from the middleware (tenantId)
        const {companyId} = req.params

        
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

const router = express.Router()

router.get('/:companyId', getAllRoomsForFrontend)

export default router