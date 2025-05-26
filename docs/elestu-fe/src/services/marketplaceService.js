//src/services/marketplaceService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Trae la lista completa de proveedores
export const getProviders = async () => {
    try {
        const resp = await axios.get(`${API_URL}/providers`);
        // asume que el back devuelve { providers: [ ... ] }
        return resp.data.providers;
    } catch (err) {
        console.error('Error fetching providers:', err.response?.data || err);
        return [];
    }
};

// Trae los datos de un proveedor concreto por su id
export const getProviderById = async (id) => {
    try {
        const resp = await axios.get(`${API_URL}/providers/${id}`);
        // asume que el back devuelve { provider: { ... } }
        return resp.data.provider;
    } catch (err) {
        console.error(`Error fetching provider ${id}:`, err.response?.data || err);
        return null;
    }
};
