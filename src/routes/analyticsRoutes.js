import express from "express"
import {
    getAverageStayTime,
    getDailyVolume,
    getRecentCkeckIns,
    getRoomsStats,
    getTotalCheckIns,
} from '../controllers/analysisController.js'
import {authCompanyMiddleware} from '../middlewares/authMiddleware.js'
import {setTenant} from '../middlewares/tenantMiddleware.js'

const router = express.Router()
router.use(authCompanyMiddleware)
router.use(setTenant)

router.get('/daily-volume', getDailyVolume)

router.get('/total',getTotalCheckIns)

router.get('/room-stats', getRoomsStats)

router.get('/average-stay', getAverageStayTime)

router.get('/recent-five-hours',getRecentCkeckIns)



export default router