// src/types/express.d.ts

// Importa la interfaz Request de express para poder extenderla.
import { Request } from 'express';

// Define la interfaz UserPayload para especificar la forma del objeto 'user'
// que Passport.js adjunta a la solicitud.
// Ajusta 'userId' y 'email' según lo que REALMENTE tengas en tu JWT.
// Por ejemplo, si tu userId es un UUID (string), cámbialo a string.
// Si tu JWT solo tiene userId, elimina 'email'.
interface UserPayload {
    userId: number; // O 'string' si tus IDs de usuario son UUIDs
    email: string;  // Si tu JWT incluye el email
    // Puedes añadir cualquier otra propiedad que esperes en el payload de tu token JWT
    // Por ejemplo: roles: string[];
}

// Extiende la interfaz Request de Express para incluir la propiedad 'user'.
// Esto le dice a TypeScript que `req.user` existe y tiene el tipo `UserPayload`.
// El '?' hace que la propiedad 'user' sea opcional, ya que no todas las rutas
// estarán protegidas por un guardia de autenticación.
declare module 'express' {
    interface Request {
        user?: UserPayload;
    }
}