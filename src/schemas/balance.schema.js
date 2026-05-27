import { z } from 'zod';
import { ALL_CATEGORIES } from '../models/balance.model.js';

const checkSchema = z.object({
  checkNumber: z.string().min(1, 'Número de cheque requerido'),
  bank:        z.string().min(1, 'Banco requerido'),
  branch:      z.string().min(1, 'Sucursal requerida'),
  date:        z.string().min(1, 'Fecha del cheque requerida'),
  amount:      z.number({ required_error: 'Monto del cheque requerido' }).min(0),
});

export const createBalanceSchema = z
  .object({
    edition: z
      .string({ required_error: 'La edición es requerida' })
      .min(1, 'La edición no puede estar vacía'),

    type: z.enum(['Ingreso', 'Egreso'], {
      required_error: 'El tipo (Ingreso/Egreso) es requerido',
    }),

    date: z.string().min(1, 'La fecha es requerida'),

    counterpart: z
      .string({ required_error: 'El campo "Recibimos de / A la orden de" es requerido' })
      .min(1, 'Debe indicar la contraparte'),

    concept: z
      .string({ required_error: 'El concepto es requerido' })
      .min(1, 'Debe indicar el concepto'),

    category: z
      .string({ required_error: 'La categoría es requerida' })
      .refine((val) => ALL_CATEGORIES.includes(val), {
        message: 'Categoría inválida',
      }),

    cashAmount:         z.number().min(0).default(0),
    transferAmount:     z.number().min(0).default(0),
    tarjetaUnicaAmount: z.number().min(0).default(0),

    checks: z.array(checkSchema).default([]),

    observations: z.string().optional().default(''),

    // Campos opcionales para rendiciones de Lotería
    taxPercentage: z.number().optional().nullable(),
    totalRenderedAmount: z.number().optional().nullable(),
    taxPaymentDate: z.string().optional().nullable(),
    declarationDate: z.string().optional().nullable(),

    // Campos opcionales rellenados automáticamente por el sistema
    sellerPaymentRef: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      const checkTotal = (data.checks ?? []).reduce(
        (sum, c) => sum + (c.amount || 0),
        0
      );
      return (
        (data.cashAmount || 0) +
        (data.transferAmount || 0) +
        (data.tarjetaUnicaAmount || 0) +
        checkTotal >
        0
      );
    },
    {
      message:
        'Debe ingresar al menos un monto mayor a cero (efectivo, transferencia o cheque)',
      path: ['cashAmount'],
    }
  );
