// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import '../App.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Estado para feedback de carga
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(email, password); // Llama a tu servicio de login
            // `result` será lo que devuelve tu authService.login,
            // que es: { success: true, data: { user: {...}, token: '...' } } o { success: false, error: '...' }

            // --- CORRECCIÓN EN LA CONDICIÓN ---
            if (result.success && result.data && result.data.user && result.data.user.id) {
                // Accedemos a través de result.data.user
                const user = result.data.user;
                const token = result.data.token;

                localStorage.setItem('userid', user.id);
                console.log('Login exitoso: UserID guardado en localStorage:', user.id);

                if (token) {
                    localStorage.setItem('authToken', token);
                    console.log('Login exitoso: AuthToken guardado en localStorage.');
                }

                localStorage.setItem('userEmail', user.email);
                localStorage.setItem('userName', user.name || ''); // Guardar nombre si existe

                navigate('/services');
            } else {
                // Si la condición falla, 'result' podría tener un error o faltar datos
                const errorMessage = result.error || 'Error en el inicio de sesión: datos de usuario incompletos o credenciales incorrectas.';
                console.error('Error en el login o datos incompletos en la respuesta:', result);
                setError(errorMessage);
            }
        } catch (err) {
            // Errores de red o excepciones no esperadas en la llamada a login()
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
