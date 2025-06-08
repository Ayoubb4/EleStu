// src/components/SecurityForm.js
import React, { useState } from 'react';
import { updateUserSecurity } from '../services/authService';
// import { useNavigate } from 'react-router-dom'; // <-- Eliminado porque no se usa
import '../App.css';

function SecurityForm() {
    // const navigate = useNavigate(); // <-- Eliminado porque no se usa
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
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        const dataToUpdate = { currentPassword: formData.currentPassword };
        if (formData.newEmail) dataToUpdate.newEmail = formData.newEmail;
        if (formData.newPassword) dataToUpdate.newPassword = formData.newPassword;

        if (!dataToUpdate.newEmail && !dataToUpdate.newPassword) {
            setMessage({ type: 'error', text: 'Debes proporcionar un nuevo email o una nueva contraseña.' });
            setIsLoading(false);
            return;
        }

        const result = await updateUserSecurity(dataToUpdate);
        if (result.success) {
            // El servicio authService ya muestra un alert y redirige,
            // por lo que no necesitamos hacer nada con 'navigate' aquí.
        } else {
            setMessage({ type: 'error', text: `Error: ${result.error}` });
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="settings-form">
            <div className="form-group">
                <label htmlFor="currentPassword">Contraseña Actual (Requerida)</label>
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
                    placeholder="Mínimo 8 caracteres"
                    disabled={isLoading}
                />
            </div>
            <button type="submit" className="form-button" disabled={isLoading}>
                {isLoading ? 'Actualizando...' : 'Actualizar Seguridad'}
            </button>
            {message && <p className={`form-message ${message.type}`}>{message.text}</p>}
        </form>
    );
}

export default SecurityForm;