import { Company } from "../model/Company.js"
import { Visitor } from "../model/Visitor.js"
import bcrypt from "bcryptjs"
import { z } from 'zod'
import { passwordUpdateSchema } from "../validators/companyValidator.js";

const updateExistingCompanyPassword = async (req, res) => {
    try {
        const validatedData = passwordUpdateSchema.parse(req.body);
        const { oldPassword, newPassword } = validatedData;

        const companyId = req.user._id;

        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, company.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        company.password = await bcrypt.hash(newPassword, salt);
        await company.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors[0].message });
        }
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};
const updateCompanyProfile = async (req, res) => {
    try {
        // 1. Identify the company from the token 
        const companyId = req.user._id;

        const updates = req.body;
        //preventing user from updating these fields manualy
        delete updates.password;
        delete updates._id;


        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            updates,
            { new: true, runValidators: true }//returns updated document and ensures follows schema
        );

        if (!updatedCompany) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                name: updatedCompany.companyName,
                email: updatedCompany.email,
                registrationNumber: updatedCompany.registrationNumber,
                contactNumber: updatedCompany.contactNumber
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Update failed",
            error: error.message
        });
    }
};
const getMyVisitors = async (req, res) => {
    try {

        const visitors = await Visitor.find({ companyId: req.tenantId })

        return res.status(200).json({ success: true, data: visitors })

    } catch (error) {

        return res.status(200).json({ message: `Error while reading database: ${error.message}` })
    }
}
const getCompanyProfile = async (req, res) => {
    try {
        const companyId = req.user._id;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                id: company._id || companyId,
                companyName: company.companyName,
                email: company.email,
                registrationNumber: company.registrationNumber,
                contactNumber: company.contactNumber,
                createdAt: company.createdAt,
                streetNumber: company.streetNumber,
                streetName: company.streetName,
                city: company.city,
                country: company.country,
                website: company.website,
                isProfileComplete: company.isProfileComplete,
                operatingHours: company.operatingHours
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
const softDeleteCompanyProfile = async (req, res) => {

    const companyId = req.user?._id

    try {
        const company = await Company.findByIdAndUpdate(companyId, { isDeleted: true })

        if (!company) return res.status(403).json({ message: "Company not found" })

        res.status(201).json({ message: "Company Profile was deleted" })

    } catch (error) {
        console.error(`Error: ${error.message}`)
    }
}
const reactivateProfile = async (req, res) => {
    const { email, password } = req.body;

    try {
        const hasProfile = await Company.findOne({ email: email });

        if (!hasProfile) {
            return res.status(404).json({
                message: 'This email address is not attached to any profile'
            });
        }

        const isValidPassword = await bcrypt.compare(password, hasProfile.password);

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const company = await Company.findByIdAndUpdate(
            hasProfile._id,
            { isDeleted: false },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            message: "Company Profile has been restored"
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({ message: "Server error during reactivation" });
    }
};
export {
    updateExistingCompanyPassword,
    getMyVisitors,
    getCompanyProfile,
    updateCompanyProfile,
    softDeleteCompanyProfile,
    reactivateProfile
}