import express from 'express'
import { logIn, logOut, createCompany } from '../controllers/authController.js'
import { createCompanySchema, loginSchema } from '../validators/authValidators.js'
import  {validateRequest} from '../middlewares/validateRequest.js'
import { reactivateProfile } from '../controllers/companyController.js'


const router = express.Router()

router.post('/login',validateRequest(loginSchema), logIn)

router.post('/logout',logOut)

router.post('/create', validateRequest(createCompanySchema), createCompany)

router.put('/profile/restore',reactivateProfile)



export default router