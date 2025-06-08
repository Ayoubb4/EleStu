// src/components/SecurityForm.js
import React, { useState } from 'react';
import { updateUserSecurity } from '../services/authService';

function SecurityForm() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newEmail: '',
        newPassword: '',
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // Solo enviar los campos que tengan valor
        const dataToUpdate = { currentPassword: formData.currentPassword };
        if (formData.newEmail) dataToUpdate.newEmail = formData.newEmail;
        if (formData.newPassword) dataToUpdate.newPassword = formData.newPassword;

        const result = await updateUserSecurity(dataToUpdate);
        if (result.success) {
            setMessage('¡Tus datos de seguridad han sido actualizados!');
            setFormData({ currentPassword: '', newEmail: '', newPassword: '' }); // Limpiar formulario
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage(`Error: ${result.error}`);
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
                <label htmlFor="currentPassword">Contraseña Actual (Requerida para cualquier cambio)</label>
                <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="form-input"
                    required
                    disabled={isLoading}
                />
            </div>
            <hr className="settings-divider-light" />
            <div className="form-group">
                <label htmlFor="newEmail">Nuevo Correo Electrónico</label>
                <input
                    type="email"
                    id="newEmail"
                    name="newEmail"
                    value={formData.newEmail}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Dejar en blanco si no se desea cambiar"
                    disabled={isLoading}
                />
            </div>
            <div className="form-group">
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Dejar en blanco si no se desea cambiar"
                    disabled={isLoading}
                />
            </div>
            <button type="submit" className="form-button" disabled={isLoading}>
                {isLoading ? 'Actualizando...' : 'Actualizar Seguridad'}
            </button>
            {message && <p className="form-message">{message}</p>}
        </form>
    );
}

export default SecurityForm;
