import { z } from 'zod'

const createRoomSchema = z.object({
    companyId: z.string('Company ID is required'),
    floor: z.string(),
    roomNumber: z.string('Room number is required'),
})


export{createRoomSchema}