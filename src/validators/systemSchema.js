import { z } from 'zod'

const loginSystemSchema = z.object({
    username: z.string().min(1,'System admin username is required'),
    password: z.string().min(1,'System password is required')
})


export{loginSystemSchema}