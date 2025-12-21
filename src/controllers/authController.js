import { Company } from "../model/Company.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/generateToken.js"


const logIn = async (req, res) => {
    const { email, password } = req.body
    try {
        const company = await Company.findOne({ email }).select('+password')
        if (!company) return res.status(403).json(
            {
                succes: false,
                message: 'Company does not exist'
            })

        const validPassword = await bcrypt.compare(password, company.password);

        if(!company || !validPassword) {
            return res.status(403).json({ message: 'Invalid email or password' })
        }
        const isSoftDeleted = await Company.exists({ isDeleted: true })
        if (isSoftDeleted) {
            return res.status(403).json({
                success: false,
                message: 'Company Profile is not active, refer to software document to reactivate profile'
            })
        }
        //GENERATES TOKEN AND SETS COOKIE
        generateToken(company._id, res)

        const safeData = company.toObject();

        return res.status(200).json({ success: true, data: safeData })

    } catch (error) {
        return res.status(500).json({ message: `Error while accessing DB ${error.message}` })
    }
    

 }



const logOut = async (req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({message:'Logged out successfully'})
}


const createCompany = async (req,res) => {
    const { email,password } = req.body
    
    const companyExits = await Company.exists({ email: email })

    if (companyExits) return res.status(403).json({ message: 'Company already exists' })
    
    const salt = await bcrypt.genSalt(10)
    
    const hashedPassword = await bcrypt.hash(password,salt)
    
    try {
        const company = await Company.create({...req.body,password:hashedPassword })

        res.status(201).json({
            success: true,
            data:company,
        })
    } catch (error) {
        if (error.code === 11000) {
        return res.status(400).json({ 
        message: `${Object.keys(error.keyValue)} already exists.` 
        });
    }
        res.status(500).json({ message: error.message });
    }
}





export {logIn, logOut,createCompany}