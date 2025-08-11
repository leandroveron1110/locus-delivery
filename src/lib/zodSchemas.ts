import { z } from 'zod';

// Esquema para la validación del formulario de Login
export const loginSchema = z.object({
  email: z.string().email({ message: 'Formato de correo electrónico inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

// Esquema para la validación del formulario de Registro
export const registerSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  email: z.string().email({ message: 'Formato de correo electrónico inválido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

// Puedes añadir más esquemas aquí a medida que los necesites (ej. para negocios, productos, etc.)
