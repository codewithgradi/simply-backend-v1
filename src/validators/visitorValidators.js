import { z } from 'zod';

 const visitorSchema = z.object({
  firstName: z.string().min(2, "Name is too short").max(50),
  lastName: z.string().min(2, "Last name is too short"),
  // SA Phone Number validation
  phoneNumber: z.string().regex(/^(?:\+27|0)[6-8][0-9]{8}$/, "Invalid SA phone number"),
  // SA ID Number (13 digits)
  idNumber: z.string().length(13, "ID number must be exactly 13 digits"),
    reasonForVisit: z.enum(['Delivery', 'Meeting', 'Maintenance', 'Personal']),
   gender: z.enum(["MALE", "FEMALE", "OTHER"]),
   companyId: z.string(),
   roomNumber:z.string(),
   email:z.string('Email is required')
 });

 export {visitorSchema}