import express from 'express'
import {
    getCompanyProfile, getMyVisitors,
    updateExistingCompanyPassword,
    updateCompanyProfile,
    softDeleteCompanyProfile
} from '../controllers/companyController.js'
import { authCompanyMiddleware } from '../middlewares/authMiddleware.js'
import { setTenant } from '../middlewares/tenantMiddleware.js'
import { passwordUpdateSchema } from '../validators/companyValidator.js'
import {validateRequest} from '../middlewares/validateRequest.js'


const router = express.Router()

router.use(authCompanyMiddleware)
router.use(setTenant)

router.get('/', getMyVisitors)

router.get('/profile',getCompanyProfile)

router.put('/profile/', updateCompanyProfile)

router.put('/profile/:companyId', validateRequest(passwordUpdateSchema), updateExistingCompanyPassword)

router.put('/profile/delete/:companyId', softDeleteCompanyProfile)



export default router