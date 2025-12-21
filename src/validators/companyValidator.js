import { z } from 'zod'

const passwordUpdateSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be 8+ characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "New password cannot be the same as the old one",
  path: ["newPassword"],
});

export {passwordUpdateSchema}