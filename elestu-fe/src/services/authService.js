// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Asegúrate de que esta URL sea correcta para tu backend

export const register = async (name, email, password) => {
    try {
        console.log('Enviando solicitud de registro:', { name, email });

        const response = await axios.post(`${API_URL}/users/register`, {
            name,
            email,
            password
        });

        console.log('Registro exitoso:', response.data);

        // **IMPORTANTE**: Asegúrate de que response.data.user existe y contiene 'id' y 'email'
        // Si tu backend devuelve el usuario directamente en response.data, ajusta esto:
        // localStorage.setItem('userId', response.data.id);
        // localStorage.setItem('userEmail', response.data.email);

        // Asumiendo que el backend devuelve un objeto 'user' anidado
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Guarda el objeto completo del usuario
        localStorage.setItem('userId', response.data.user.id);       // <-- ESTANDARIZADO: 'userId' (camelCase)
        localStorage.setItem('userEmail', response.data.user.email); // <-- ESTANDARIZADO: 'userEmail' (camelCase)
        localStorage.setItem('isAuthenticated', 'true');
        // Si el registro también devuelve un token JWT, guárdalo aquí:
        // localStorage.setItem('authToken', response.data.token);

        return { success: true, data: response.data };
    } catch (error) {
        console.error('Error en registro:', error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.message || 'Error al registrar usuario'
        };
    }
};

export const login = async (email, password) => {
    try {
        console.log('Intentando iniciar sesión:', { email });

        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });

        console.log('Respuesta de login:', response.data);

        // **IMPORTANTE**: Verifica la estructura de response.data.user y response.data.token
        // Asegúrate de que response.data.user exista y contenga 'id' y 'email'.
        // Asegúrate de que response.data.token contenga el token JWT.

        if (response.data.success) {
            // Guardar la información del usuario en localStorage
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('userId', response.data.user.id);       // <-- ESTANDARIZADO: 'userId' (camelCase)
            localStorage.setItem('userEmail', response.data.user.email); // <-- ESTANDARIZADO: 'userEmail' (camelCase)
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('authToken', response.data.token);      // <-- AÑADIDO: Guardar el token JWT

            return { success: true, data: response.data };
        } else {
            return {
                success: false,
                error: 'Credenciales inválidas'
            };
        }
    } catch (error) {
        console.error('Error en login:', error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.message || 'Credenciales inválidas'
        };
    }
};

export const logout = () => {
    // Limpiar todos los elementos de autenticación del localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userId');       // <-- ESTANDARIZADO
    localStorage.removeItem('userEmail');    // <-- ESTANDARIZADO
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authToken');    // <-- AÑADIDO: Eliminar el token
    console.log('Sesión cerrada correctamente');
};

export const verifyAuth = async () => {
    // Verificamos si el usuario está autenticado usando localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const authToken = localStorage.getItem('authToken'); // Obtener el token

    if (!isAuthenticated || !authToken) { // Verificar también si hay token
        console.log('No hay sesión activa o token en localStorage');
        return false;
    }

    try {
        // Enviar el token en el header Authorization para la verificación del servidor
        const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}` // Enviar el token JWT
            }
        });
        console.log('Respuesta de verificación:', response.data);
        return response.data.isValid;
    } catch (error) {
        console.error('Error verificando autenticación:', error.response?.data || error);
        // Si hay un error (ej. token expirado/inválido), limpiamos todos los datos del localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('userId');       // <-- ESTANDARIZADO
        localStorage.removeItem('userEmail');    // <-- ESTANDARIZADO
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('authToken');    // <-- AÑADIDO: Eliminar el token
        return false;
    }
};

export const forgotPassword = async (email) => {
    try {
        console.log('Enviando solicitud de recuperación de contraseña:', { email });

        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });

        console.log('Respuesta de recuperación:', response.data);

        return {
            success: true,
            message: 'Si el correo existe, recibirás un mensaje con tu contraseña'
        };
    } catch (error) {
        console.error('Error en recuperación de contraseña:', error.response?.data || error);
        return {
            success: false,
            error: error.response?.data?.message || 'No se pudo procesar la solicitud'
        };
    }
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        const user = JSON.parse(userStr);
        return user;
    } catch (error) {
        console.error('Error al parsear datos de usuario:', error);
        return null;
    }
};