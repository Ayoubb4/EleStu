// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import '../App.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password);
            // El 'result' que llega aquí desde authService ahora es:
            // { success: true, user: {...}, token: '...' } en caso de éxito,
            // o { success: false, error: '...' } en caso de fallo.

            // --- CORRECCIÓN EN LA CONDICIÓN ---
            // Verificamos que 'result' tenga las propiedades que indican un éxito:
            // 'success' en true, un objeto 'user' con su 'id', y un 'token'.
            if (result.success && result.user && result.user.id && result.token) {
                // authService.login ya guardó toda la información en localStorage.
                // Aquí solo necesitamos confirmar el éxito y navegar.
                console.log('Login exitoso y verificado en el componente. Navegando...');
                navigate('/services');
            } else {
                // Si la condición falla, es porque 'result' tiene un error o le faltan datos.
                const errorMessage = result.error || 'Error en el inicio de sesión: datos de usuario incompletos o credenciales incorrectas.';
                console.error('Error en el login o datos incompletos en la respuesta:', result);
                setError(errorMessage);
            }
        } catch (err) {
            // Este bloque captura errores de red o excepciones no esperadas.
            console.error('Error catastrófico en handleLogin:', err);
            setError('Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="login-background" />
            <div className="login-wrapper">
                <div className="login-box">
                    <h2>Login</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                            autoComplete="email"
                            disabled={isLoading}
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            autoComplete="current-password"
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Iniciando Sesión...' : 'Sign In'}
                        </button>
                    </form>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                    <p style={{ marginTop: '15px' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">Sign Up</Link>
                    </p>
                    <p>
                        <Link to="/forgot-password" className="auth-link">
                            Forgot Password?
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;