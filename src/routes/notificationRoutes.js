import { clearAllNotifications, getAllNotifications, markAllRead } from "../controllers/notificationController.js"
import express from "express"
import {setTenant} from '../middlewares/tenantMiddleware.js'
import { authCompanyMiddleware } from "../middlewares/authMiddleware.js"
const router = express.Router()

router.use(authCompanyMiddleware)
router.use(setTenant)

router.put('/', markAllRead)
router.get('/', getAllNotifications)
router.delete('/',clearAllNotifications)


export default router