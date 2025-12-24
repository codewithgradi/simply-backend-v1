import express from 'express'
import { Company } from '../model/Company.js';
import bcrypt from 'bcryptjs';

const router = express.Router()




 const reactivate = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Force the password field to be selected
        const hasProfile = await Company.findOne({ email }).select("+password");

        if (!hasProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // 2. Compare. If hasProfile.password was missing, this would always be false.
        const isValidPassword = await bcrypt.compare(password, hasProfile.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Update the document
        hasProfile.isDeleted = false;
        await hasProfile.save();

        res.status(200).json({ success: true, message: "Profile restored" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.put('/', reactivate)


export default router