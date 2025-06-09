// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, loginWithGoogle } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';
import '../App.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/services');
        } else {
            setError(result.error || 'Error desconocido');
        }
        setIsLoading(false);
    };

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        setIsLoading(true);
        const result = await loginWithGoogle(credentialResponse.credential);
        if (result.success) {
            navigate('/services');
        } else {
            setError(result.error || 'Error en el inicio de sesión con Google.');
        }
        setIsLoading(false);
    };

    const handleGoogleLoginError = () => {
        setError('No se pudo iniciar sesión con Google.');
    };

    return (
        <>
            <div className="login-background" />
            <div className="login-wrapper">
                <div className="login-box">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required disabled={isLoading} />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required disabled={isLoading} />
                        <button type="submit" disabled={isLoading}>{isLoading ? 'Iniciando...' : 'Sign In'}</button>
                    </form>

                    {/* --- AÑADIDO: Botón de Google y separador --- */}
                    <div className="or-divider"></div>
                    <div className="google-login-button-container">
                        <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginError}
                            useOneTap
                            theme="outline"
                            size="large"
                            text="signin_with"
                            shape="rectangular"
                        />
                    </div>
                    {/* --- FIN DE LA ADICIÓN --- */}

                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                    <p style={{ marginTop: '15px' }}>
                        Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
                    </p>
                    <p>
                        <Link to="/forgot-password" className="auth-link">Forgot Password?</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;