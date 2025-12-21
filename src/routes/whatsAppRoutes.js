import express from "express";
import {authCompanyMiddleware} from '../middlewares/authMiddleware.js'
import { linkedWhatsApp } from "../controllers/whatsAppController.js";

const router = express.Router()

router.get('/connect',authCompanyMiddleware,linkedWhatsApp)


export default router