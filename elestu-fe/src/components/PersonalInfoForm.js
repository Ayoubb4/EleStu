// src/components/PersonalInfoForm.js
import React, { useState, useEffect } from 'react';
import { getCurrentUser, updatePersonalInfo } from '../services/authService';
import '../App.css';

// Lista de países y sus prefijos. Puedes añadir más si lo necesitas.
const countryCodes = [
    { code: 'ES', prefix: '+34', name: 'España' },
    { code: 'PT', prefix: '+351', name: 'Portugal' },
    { code: 'FR', prefix: '+33', name: 'Francia' },
    { code: 'DE', prefix: '+49', name: 'Alemania' },
    { code: 'GB', prefix: '+44', name: 'Reino Unido' },
    { code: 'US', prefix: '+1', name: 'Estados Unidos' },
];

function PersonalInfoForm() {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        phonePrefix: '+34', // Por defecto España
        phoneNumberOnly: '', // Solo el número, sin prefijo
    });
    const [message, setMessage] =useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            // Lógica para separar el prefijo del número si ya existe
            let prefix = '+34';
            let number = user.phoneNumber || '';

            const foundCountry = countryCodes.find(c => user.phoneNumber?.startsWith(c.prefix));
            if (foundCountry) {
                prefix = foundCountry.prefix;
                number = user.phoneNumber.substring(prefix.length);
            }

            setFormData({
                name: user.name || '',
                lastName: user.lastName || '',
                phonePrefix: prefix,
                phoneNumberOnly: number.trim(),
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Unimos el prefijo y el número antes de enviar
        const fullPhoneNumber = formData.phoneNumberOnly ? `${formData.phonePrefix}${formData.phoneNumberOnly.trim()}` : '';

        const dataToUpdate = {
            name: formData.name,
            lastName: formData.lastName,
            phoneNumber: fullPhoneNumber || undefined, // Enviar undefined si el campo está vacío
        };

        const result = await updatePersonalInfo(dataToUpdate);
        if (result.success) {
            setMessage({ type: 'success', text: '¡Tus datos han sido actualizados con éxito!' });
        } else {
            setMessage({ type: 'error', text: `Error: ${result.error}` });
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isLoading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="lastName">Apellidos</label>
                <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isLoading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="phoneNumber">Número de Teléfono</label>
                {/* --- AÑADIDO: Grupo para Prefijo + Número --- */}
                <div className="phone-input-group">
                    <select
                        name="phonePrefix"
                        value={formData.phonePrefix}
                        onChange={handleChange}
                        className="country-code-select"
                        disabled={isLoading}
                    >
                        {countryCodes.map(country => (
                            <option key={country.code} value={country.prefix}>
                                {country.name} ({country.prefix})
                            </option>
                        ))}
                    </select>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumberOnly"
                        value={formData.phoneNumberOnly}
                        onChange={handleChange}
                        className="form-input phone-number-input"
                        placeholder="Tu número"
                        disabled={isLoading}
                    />
                </div>
                {/* --- FIN DE LA ADICIÓN --- */}
            </div>
            <button type="submit" className="form-button" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
        </form>
    );
}

export default PersonalInfoForm;
