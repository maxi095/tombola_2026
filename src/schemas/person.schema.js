import {z} from 'zod';

export const createPersonSchema = z.object({
    firstName: z.string({
        required_error: 'First name is required',
    }),
    lastName: z.string({
        required_error: 'Last name is required',
    }),
    email: z.string().email().optional().or(z.literal('')),

});