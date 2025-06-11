// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, loginWithGoogle } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import '../App.css';
import Navbar from "./Navbar";

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); // Añadido estado para el teléfono
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (email !== confirmEmail) {
            setError('Los correos electrónicos no coinciden.');
            return;
        }

        setIsLoading(true);

        try {
            // Creamos un objeto con todos los datos del usuario
            const userData = {
                name,
                email,
                password,
                phoneNumber: phoneNumber.trim() || undefined, // Enviar undefined si está vacío
            };

            const result = await register(userData);

            if (result && result.success) {
                alert('¡Registro exitoso! Serás redirigido a la página de inicio de sesión.');
                navigate('/login');
            } else {
                setError(result.error || 'Error en el registro. Inténtalo de nuevo.');
            }
        } catch (err) {
            console.error('Error durante el registro:', err);
            setError(err.message || 'Ocurrió un error inesperado durante el registro.');
        } finally {
            setIsLoading(false);
        }
    };

    // Lógica para el login/registro con Google
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setIsLoading(true);
        const result = await loginWithGoogle(credentialResponse.credential);
        if (result.success) {
            navigate('/services'); // Si tiene éxito, va directo a los servicios
        } else {
            setError(result.error || 'Error al registrarse con Google.');
        }
        setIsLoading(false);
    };

    const handleGoogleLoginError = () => {
        setError('No se pudo registrar con Google.');
    };

    return (
        <>
            <Navbar />
            <div className="register-wrapper">
                <div className="register-box">
                    <h2>Crear Cuenta</h2>
                    <form onSubmit={handleRegister}>
                        <label htmlFor="name">Nombre de Usuario</label>
                        <input
                            id="name" type="text" value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre de usuario" required disabled={isLoading}
                        />

                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password" type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Crea una contraseña segura" required disabled={isLoading}
                        />

                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu.email@ejemplo.com" required disabled={isLoading}
                        />

                        <label htmlFor="confirmEmail">Confirmar Correo</label>
                        <input
                            id="confirmEmail" type="email" value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            placeholder="Confirma tu email" required disabled={isLoading}
                        />

                        <label htmlFor="phoneNumber">Número de Teléfono (Opcional)</label>
                        <input
                            id="phoneNumber" type="tel" value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Ej: +34600000000" disabled={isLoading}
                        />

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </form>

                    <div className="or-divider"></div>
                    <div className="google-login-button-container">
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginError}
                            text="signup_with"
                        />
                    </div>

                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                    <p style={{ marginTop: '15px' }}>
                        Ya tienes una cuenta? <Link to="/login" className="auth-link">Iniciar sesión</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Register;