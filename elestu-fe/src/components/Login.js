import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import '../App.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await login(email, password);
        if (result.success) {
            navigate('/services');
        } else {
            setError(result.error || 'Error en el inicio de sesión');
        }
    };

    return (
        <>
            {/* capa de fondo */}
            <div className="login-background" />

            {/* wrapper centrado */}
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
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button type="submit">Sign In</button>
                    </form>
                    {error && <p style={{color: 'red'}}>{error}</p>}

                    <p>
                        Don't have an account?{' '}
                        <button type="submit"><Link to="/register">Sign Up</Link></button>

                    </p>
                    <p>
                        Forgetting your password{' '}
                        <Link to="/forgot-password" className="forgot-password-link">
                            Forgot Password?
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;
