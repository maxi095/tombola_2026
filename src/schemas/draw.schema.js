import { z } from 'zod';

export const createDrawSchema = z.object({
    edition: z.string({
        required_error: 'Edition ID is required'
    }).min(1, 'Edition ID cannot be empty'),
    
    type: z.enum(['Mensual', 'Final'], {
        required_error: 'Type is required'
    }),
    
    drawDate: z.string({
        required_error: 'Draw date is required'
    }).min(1, 'Draw date cannot be empty'),
    
    description: z.string().optional(),
    
    prizes: z.array(z.object({
        position: z.number({
            required_error: 'Prize position is required'
        }).min(1, 'Position must be at least 1'),
        description: z.string().optional(),
        notes: z.string().optional()
    })).min(1, 'At least one prize is required'),
    
    user: z.string({
        required_error: 'User ID is required'
    }).min(1, 'User ID cannot be empty').optional(),
});

export const registerWinnerSchema = z.object({
    drawId: z.string({
        required_error: 'Draw ID is required'
    }).min(1, 'Draw ID cannot be empty'),
    
    prizePosition: z.number({
        required_error: 'Prize position is required'
    }).min(1, 'Position must be at least 1'),
    
    bingoCardNumber: z.number({
        required_error: 'Bingo card number is required'
    }).min(1, 'Bingo card number must be valid')
});

export const registerDrawnNumbersSchema = z.object({
    drawId: z.string({
        required_error: 'Draw ID is required'
    }).min(1, 'Draw ID cannot be empty'),
    
    drawnNumbers: z.array(z.number().min(1).max(90))
        .min(1, 'At least one number is required')
        .max(90, 'Cannot have more than 90 numbers')
});