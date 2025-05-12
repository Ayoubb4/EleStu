import React, { useState } from 'react';
import { forgotPassword } from '../services/authService';
import { Link } from 'react-router-dom';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const result = await forgotPassword(email);

            if (result.success) {
                setMessage(result.message);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Ha ocurrido un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Recuperar Contraseña</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico"
                        required
                        disabled={loading}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Recuperar Contraseña'}
                </button>
            </form>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <p>
                <Link to="/login">Volver al inicio de sesión</Link>
            </p>
        </div>
    );
}

export default ForgotPassword;