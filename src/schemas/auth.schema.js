import { z } from "zod";

export const signInSchema = z.object({
  email: z.string({
      required_error: 'El email es requerido',
      invalid_type_error: 'El email debe ser una cadena de texto',
    })
    .trim()
    .toLowerCase()
    .max(255)
    .refine(
      (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      { message: 'El email no es válido' }
    ),
  password: z.string({
      required_error: 'La contraseña es requerida',
      invalid_type_error: 'La contraseña debe ser una cadena de texto',
    })
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});