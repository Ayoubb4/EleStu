// src/services/authService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
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
 * @returns {Promise<object>}
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

        if (response.data.success && response.data.user && response.data.token) {
            logout(); // Limpiar datos de sesión antiguos antes de establecer los nuevos.

            // Guardar la nueva información de sesión.
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('userid', response.data.user.id);
            localStorage.setItem('authToken', response.data.token);

            // Devolvemos un objeto que contiene TODO para que el componente Login lo pueda usar.
            return {
                success: true,
                user: response.data.user,
                token: response.data.token,
            };
        }
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
    const keysToRemove = ['user', 'userid', 'authToken', 'userEmail', 'userName', 'isAuthenticated'];
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Sesión cerrada y localStorage limpiado.');
};

// --- AÑADIDO: Función para login con Google ---
/**
 * Inicia sesión usando un token de Google.
 * @param {string} googleToken - El ID Token de Google (credential).
 * @returns {Promise<object>}
 */
export const loginWithGoogle = async (googleToken) => {
    try {
        console.log('Enviando token de Google al backend...');
        const response = await axios.post(`${API_URL}/auth/google`, {
            token: googleToken,
        });
        console.log('Respuesta de login con Google:', response.data);

        if (response.data.success && response.data.user && response.data.token) {
            logout(); // Limpiar sesión antigua
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('userid', response.data.user.id);
            localStorage.setItem('authToken', response.data.token);
            return { success: true, user: response.data.user };
        }
        return { success: false, error: response.data.message || 'Respuesta inesperada del servidor.' };
    } catch (error) {
        console.error('Error en servicio de login con Google:', error.response?.data || error.message);
        return { success: false, error: error.response?.data?.message || 'Fallo en el login con Google.' };
    }
};
// --- FIN DE LA ADICIÓN ---


/**
 * Actualiza los datos personales del usuario.
 * @param {object} personalData - Objeto con name, lastName, y/o phoneNumber.
 * @returns {Promise<object>}
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
        return { success: true, user: response.data };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'Error al actualizar los datos.' };
    }
};

/**
 * Actualiza los datos de seguridad del usuario (email/contraseña).
 * @param {object} securityData - Objeto con currentPassword, y opcionalmente newEmail, newPassword.
 * @returns {Promise<object>}
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
        window.location.href = '/login';
        return { success: true, message: response.data.message };
    } catch (error) {
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
        return null;
    }
};

/**
 * Verifica si el token de autenticación actual sigue siendo válido.
 * @returns {Promise<boolean>}
 */
export const verifyAuth = async () => {
    const authToken = getAuthToken();
    if (!authToken) {
        return false;
    }
    try {
        const response = await axios.get(`${API_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return response.data.isValid;
    } catch (error) {
        logout();
        return false;
    }
};

/**
 * Solicita un reseteo de contraseña para un email.
 * @param {string} email
 * @returns {Promise<object>}
 */
export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
        return { success: true, message: response.data.message || 'Si el correo existe, recibirás un mensaje.' };
    } catch (error) {
        return { success: false, error: error.response?.data?.message || 'No se pudo procesar la solicitud.' };
    }
};