import { z } from 'zod'

const logSchema = z.object({
     aminId: z.string(),
     action: z.string(),
     targetId: z.string().optional(),
     details : z.string().optional()
})

export {logSchema}