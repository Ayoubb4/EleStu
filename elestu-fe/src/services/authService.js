//src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const register = async (name, email, password) => {
    try {
        console.log('Enviando solicitud de registro:', { name, email });

        const response = await axios.post(`${API_URL}/users/register`, {
            name,
            email,
            password
        });

        console.log('Registro exitoso:', response.data);

        // Guardar los datos del usuario en localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('userid', response.data.id); // Guardar el userid
        localStorage.setItem('isAuthenticated', 'true');

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

        if (response.data.success) {
            // Guardar la información del usuario
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('userid', response.data.user.id); // Guardar el userid en login
            localStorage.setItem('isAuthenticated', 'true');

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
    localStorage.removeItem('user');
    localStorage.removeItem('userid');
    localStorage.removeItem('isAuthenticated');
    console.log('Sesión cerrada correctamente');
};

export const verifyAuth = async () => {
    // Verificamos si el usuario está autenticado usando localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
        console.log('No hay sesión activa en localStorage');
        return false;
    }

    try {
        // Verificamos en el servidor
        const response = await axios.get(`${API_URL}/auth/verify`);
        console.log('Respuesta de verificación:', response.data);
        return response.data.isValid;
    } catch (error) {
        console.error('Error verificando autenticación:', error.response?.data || error);
        // Si hay un error, limpiamos los datos del localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
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
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error al parsear datos de usuario:', error);
        return null;
    }
};
