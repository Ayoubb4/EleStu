import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';
import Navbar from './Navbar.js';
import '../App.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (email !== confirmEmail) {
            setError('Los correos no coinciden');
            return;
        }

        const result = await register(name, email, password);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.error || 'Error en el registro');
        }
    };

    return (
        <>
            <Navbar /> {/* ← Aquí aparece la barra de navegación */}
            <div className="register-wrapper">
                <div className="register-box">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleRegister}>
                        <label htmlFor="name">UserName</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <label htmlFor="password">PassWord</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <label htmlFor="confirmEmail">Email Confirmation</label>
                        <input
                            id="confirmEmail"
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            required
                        />

                        <div className="captcha">
                            <div className="g-recaptcha" data-sitekey="your-site-key"></div>
                        </div>

                        <button type="submit">Sign In Now</button>
                    </form>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <p>¿Ya tienes una cuenta? <a href="/login">Iniciar sesión</a></p>
                </div>
            </div>
        </>
    );
}

export default Register;
