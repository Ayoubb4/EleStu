// src/components/PersonalInfoForm.js
import React, { useState, useEffect } from 'react';
import { getCurrentUser, updatePersonalInfo } from '../services/authService';

function PersonalInfoForm() {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        phoneNumber: '',
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setFormData({
                name: user.name || '',
                lastName: user.lastName || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const result = await updatePersonalInfo(formData);
        if (result.success) {
            setMessage('¡Tus datos han sido actualizados con éxito!');
            setTimeout(() => setMessage(''), 3000); // Limpia el mensaje después de 3 segundos
        } else {
            setMessage(`Error: ${result.error}`);
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
                <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="form-input"
                    disabled={isLoading}
                />
            </div>
            <button type="submit" className="form-button" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {message && <p className="form-message">{message}</p>}
        </form>
    );
}

export default PersonalInfoForm;
