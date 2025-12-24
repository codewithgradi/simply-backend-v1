import express from "express"
import { createRoom,deleteOneRoom,getAllRooms,getOneRoom,updateRoomDetails } from "../controllers/roomController.js"
import { authCompanyMiddleware } from "../middlewares/authMiddleware.js"
import { setTenant } from "../middlewares/tenantMiddleware.js"
import {validateRequest} from '../middlewares/validateRequest.js'
import { createRoomSchema } from "../validators/roomValidators.js"

const router = express.Router()


router.use(authCompanyMiddleware)
router.use(setTenant)
router.get('/',setTenant,getAllRooms)
router.post('/', validateRequest(createRoomSchema),createRoom)
router.get('/:roomId',getOneRoom)
router.put('/:roomId',updateRoomDetails)
router.delete('/:roomId',deleteOneRoom)


export default router