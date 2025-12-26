import express from "express";
import { checkOut, checkIn } from "../controllers/visitorController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { visitorSchema } from "../validators/visitorValidators.js";
import { authCompanyMiddleware } from "../middlewares/authMiddleware.js";
import { setTenant,setTenantFromPost } from "../middlewares/tenantMiddleware.js";

const router = express.Router()


router.post('/checkin',
    setTenantFromPost,
    validateRequest(visitorSchema),
    checkIn)

router.post('/checkout',authCompanyMiddleware,setTenant, checkOut)

export default router