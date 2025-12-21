import { Company } from "../model/Company.js"
import mongoose from "mongoose"
import { Visitor } from "../model/Visitor.js"
import { Room } from "../model/Room.js"
import { Notification } from "../model/Notification.js"
import { generateToken } from "../utils/generateToken.js"
import {Log} from '../model/Log.js'

const deleteCompanyProfilePermenantly = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params; 

        if (!id) {
            return res.status(400).json({ message: "Company ID is required in parameters" });
        }

        await Visitor.deleteMany({ companyId: id }).session(session);
        await Room.deleteMany({ companyId: id }).session(session);
        await Notification.deleteMany({ companyId: id }).session(session);

        const deletedCompany = await Company.findByIdAndDelete(id).session(session);

        if (!deletedCompany) {
            throw new Error("Company not found");
        }
        
        await Log.create({
        adminId: "ADMIN_!@#",
        action: 'PERMANENT_DELETE',
        targetId: id,
        details: { companyName: deletedCompany.name }
        });

        await session.commitTransaction();

        res.status(200).json({ 
            success: true, 
            message: "Company and all associated visitors deleted permanently" 
        });

        
    } catch (error) {
        await session.abortTransaction();
        res.status(error.message === "Company not found" ? 404 : 500).json({ 
            error: error.message 
        });
    } finally {
        session.endSession();
    }
};
const getAllCompanies = async (_req, res) => {
    try {
        const companies = await Company.find().select('-password')

        await Log.create({
            adminId: "ADMIN_!@#",
            action: 'VIEWED_REGISTERED_COMPANY_PROFILES',
        });

        if (companies.length === 0) return res.status(403).json({ success: false, message: 'No existing Companies' })
        
        return res.status(200).json({ success: true, count: companies.length, data: companies })
        
    } catch (err) {
        console.error(`Error fetching companies: ${err.message}`);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching companies' 
        });
    }
    
}
const sysLogIn = async (req, res) => {
    try {
        const { username, password } = req.body;
    
        const systemPassword = process.env.SYS_PASSWORD;
        const systemUsername = process.env.SYS_USER;
        const sysID = process.env.SYS_ID || 'SYSTEM_ADMIN'; 

        if (username !== systemUsername || password !== systemPassword) {
            return res.status(403).json({
                message: 'Invalid credentials'
            });
        }

        // 1. Call generateToken and capture the token it returns
        const token = generateToken(sysID, res);

        await Log.create({
            adminId: "ADMIN_!@#",
            action: 'LOGGED_IN',
        });

        res.status(201).json({ 
            success: true,
            message: 'Welcome Administrator',
            token: token 
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const sysLogOut = async (_req,res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    })
    try {
        await Log.create({
            adminId: "ADMIN_!@#",
            action: 'LOGGED_OUT',
        });
        res.status(200).json({ message: 'Logged out successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
}

export{deleteCompanyProfilePermenantly,getAllCompanies,sysLogOut,sysLogIn}