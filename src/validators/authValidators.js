import { z } from 'zod'

// Regex for YYYY/NNNNNN/NN format
const cipcRegex = /^\d{4}\/\d{6}\/\d{2}$/;

const createCompanySchema = z.object({
    companyName: z.string().min(3, 'Company must be at least 3 character long').max(100).trim(),
    email: z.string().email('Provide a valid business email').trim().lowercase().trim(),
    password: z
        .string().
        min(8, "Password must be at least 8 characters long")
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain atleast one number'),
    contactNumber: z.string().regex(/^(?:\+27|0)[6-8][0-9]{8}$/,"Invalid SA contact number")
    
})
const loginSchema = z.object({
    email: z.string().trim().min(1, 'Enail is required').toLowerCase().email('Provide a valid email'),
    password:z.string().min(1,"Password is required")  
})


export {createCompanySchema,loginSchema}

