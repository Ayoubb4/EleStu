// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Asegúrate de que esta URL es correcta

// --- Helper para obtener el token de forma segura ---
const getAuthToken = () => {
    try {
        return localStorage.getItem('authToken');
    } catch (e) {
        console.error("No se pudo acceder a localStorage:", e);
        return null;
    }
};

/**
 * Registra un nuevo usuario.
 * @param {object} userData - Objeto con { name, email, password, phoneNumber? }.
 * @returns {Promise<object>} - Objeto con { success, user } o { success, error }.
 */
export const register = async (userData) => {
    try {
        console.log('Enviando solicitud de registro con datos:', userData);
        const response = await axios.post(`${API_URL}/users/register`, userData);
        console.log('Respuesta del registro:', response.data);
        return { success: true, user: response.data };
    } catch (error) {
        console.error('Error en servicio de registro:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'Error al registrar usuario.' };
    }
};

/**
 * Inicia la sesión de un usuario.
 * @param {string} email - El email del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<object>} - Objeto con { success, user, token } o { success, error }.
 */
export const login = async (email, password) => {
    try {
        console.log('Intentando iniciar sesión:', { email });
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        console.log('Respuesta de login:', response.data);

        // Asumiendo que el backend, si tiene éxito, devuelve { success: true, user: {...}, token: '...' }
        if (response.data.success && response.data.user && response.data.token) {
            // Limpiar datos de sesión antiguos antes de establecer los nuevos.
            logout();
            // Guardar la nueva información de sesión.
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('userid', response.data.user.id);
            localStorage.setItem('authToken', response.data.token);

            // --- CORRECCIÓN CLAVE ---
            // Devolvemos un objeto que contiene TODO: success, user y token,
            // para que el componente Login pueda verificarlo correctamente.
            return {
                success: true,
                user: response.data.user,
                token: response.data.token,
            };
        }
        // Si la respuesta del backend no tiene la estructura esperada.
        return { success: false, error: response.data.message || 'Respuesta inesperada del servidor.' };
    } catch (error) {
        console.error('Error en servicio de login:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'Credenciales inválidas.' };
    }
};

/**
 * Cierra la sesión del usuario limpiando localStorage.
 */
export const logout = () => {
    // Lista de claves a limpiar para asegurar consistencia
    const keysToRemove = ['user', 'userid', 'authToken', 'userEmail', 'userName', 'isAuthenticated'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Sesión cerrada y localStorage limpiado.');
};

/**
 * Actualiza los datos personales del usuario.
 * @param {object} personalData - Objeto con name, lastName, y/o phoneNumber.
 * @returns {Promise<object>} - El objeto del usuario actualizado.
 */
export const updatePersonalInfo = async (personalData) => {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'No estás autenticado.' };

    try {
        const response = await axios.patch(`${API_URL}/users/profile/personal`, personalData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Datos personales actualizados en localStorage.');

        return { success: true, user: response.data };
    } catch (error) {
        console.error('Error actualizando datos personales:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'Error al actualizar los datos.' };
    }
};

/**
 * Actualiza los datos de seguridad del usuario (email/contraseña).
 * @param {object} securityData - Objeto con currentPassword, y opcionalmente newEmail, newPassword.
 * @returns {Promise<object>} - Un mensaje de éxito o un objeto de error.
 */
export const updateUserSecurity = async (securityData) => {
    const token = getAuthToken();
    if (!token) return { success: false, error: 'No estás autenticado.' };

    try {
        const response = await axios.patch(`${API_URL}/users/profile/security`, securityData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        alert('Datos de seguridad actualizados. Se cerrará tu sesión para que vuelvas a iniciarla.');
        logout();
        window.location.href = '/login'; // Redirigir a la página de login

        return { success: true, message: response.data.message };
    } catch (error) {
        console.error('Error actualizando datos de seguridad:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'Error al actualizar los datos.' };
    }
};

/**
 * Obtiene los datos del usuario actual desde localStorage.
 * @returns {object|null}
 */
export const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error("Error al parsear datos de usuario desde localStorage:", error);
        return null;
    }
};

/**
 * Verifica si el token de autenticación actual sigue siendo válido.
 * @returns {Promise<boolean>} - True si es válido, false si no.
 */
export const verifyAuth = async () => {
    const authToken = getAuthToken();
    if (!authToken) {
        console.log('verifyAuth: No hay token en localStorage.');
        return false;
    }

    try {
        const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        console.log('Respuesta de verificación de token:', response.data);
        return response.data.isValid;
    } catch (error) {
        console.error('Error verificando token de autenticación:', error.response?.data || error);
        logout(); // Si hay un error (ej. token expirado), limpiar sesión
        return false;
    }
};

/**
 * Solicita un reseteo de contraseña para un email.
 * @param {string} email - El email del usuario que olvidó su contraseña.
 * @returns {Promise<object>} - Objeto con { success, message } o { success, error }.
 */
export const forgotPassword = async (email) => {
    try {
        console.log('Enviando solicitud de recuperación de contraseña para:', email);
        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
        console.log('Respuesta de recuperación:', response.data);
        return { success: true, message: response.data.message || 'Si el correo existe, recibirás un mensaje.' };
    } catch (error) {
        console.error('Error en recuperación de contraseña:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'No se pudo procesar la solicitud.' };
    }
};
