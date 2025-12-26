import express from "express";
import { deleteCompanyProfilePermenantly, getAllCompanies, sysLogIn, sysLogOut} from "../controllers/softwareController.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { loginSystemSchema } from "../validators/systemSchema.js";
import { authSystemMiddleware } from "../middlewares/authMiddleware.js";
// import { logSchema } from "../validators/logValidator.js";

const router = express.Router()
// router.use(validateRequest(logSchema))

router.get('/',authSystemMiddleware, getAllCompanies)
router.delete('/:id', authSystemMiddleware,deleteCompanyProfilePermenantly)
router.post('/login',validateRequest(loginSystemSchema), sysLogIn)
router.post('/logout',sysLogOut)

export default router