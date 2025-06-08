// src/components/ForgotPassword.js
import React, { useState } from 'react';
import { forgotPassword } from '../services/authService';
import { Link } from 'react-router-dom';
import '../App.css';
import Navbar from "./Navbar"; // Importamos el Navbar que ya es "inteligente"

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
        } catch (err) {
            setError('Ha ocurrido un error inesperado al intentar enviar el correo.');
            console.error('Forgot password error:', err);
        } finally {
            setLoading(false);
        }
    };

    // --- CORREGIDO: Estructura del return ---
    // Usamos un fragmento <>...</> para envolver todo en un solo elemento raíz.
    // El Navbar se renderiza una sola vez, al principio.
    return (
        <>
            <Navbar />
            <div className="forgot-password-page-container">
                <div className="forgot-password-content-wrapper">
                    <div className="forgot-password-box">
                        <h2 className="forgot-password-title">
                            Introduce el Correo Electronico para recuperar tu Contraseña
                        </h2>

                        <form onSubmit={handleSubmit} className="forgot-password-form">
                            <div className="input-group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Correo electrónico"
                                    required
                                    disabled={loading}
                                    className="forgot-password-input"
                                />
                            </div>

                            {message && (
                                <p className="forgot-password-message success">
                                    {message}
                                </p>
                            )}
                            {error && (
                                <p className="forgot-password-message error">
                                    {error}
                                </p>
                            )}

                            <div className="forgot-password-buttons-container">
                                <Link
                                    to="/login"
                                    className="forgot-password-button back-button"
                                >
                                    Volver al Inicio
                                </Link>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="forgot-password-button submit-button"
                                >
                                    {loading ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;