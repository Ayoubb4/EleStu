// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Importar Link
import { register } from '../services/authService';
import Navbar from './Navbar.js';
import '../App.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Estado para feedback de carga
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores previos
        if (email !== confirmEmail) {
            setError('Los correos electrónicos no coinciden.');
            return;
        }

        setIsLoading(true); // Indicar que el proceso ha comenzado

        try {
            const result = await register(name, email, password); // Llama a tu servicio de registro

            // Es crucial saber qué estructura tiene 'result'.
            // Asumimos que devuelve algo como { success: true } o { success: false, error: 'mensaje' }
            // o que lanza un error que el catch capturará.

            if (result && result.success) {
                // Si el backend/servicio indica éxito explícitamente
                alert('¡Registro exitoso! Serás redirigido a la página de inicio de sesión.');
                navigate('/login');
            } else if (result && result.error) {
                // Si el backend/servicio devuelve un error controlado
                setError(result.error);
            } else if (result && !result.success) {
                // Si success es false pero no hay un mensaje de error específico en result.error
                setError('Error en el registro. La respuesta no fue exitosa pero no se proporcionó un error específico.');
            } else if (!result) {
                // Si el servicio 'register' devuelve undefined o null en caso de éxito no explícito
                // pero el usuario se crea (como indicas), entonces la navegación es apropiada.
                // Esto depende de cómo esté implementado tu `authService.register`.
                // Si llega aquí y el usuario SÍ se creó, es que `result` no tiene `success: true`.
                // Considera que tu `authService.register` debe ser consistente.
                // Por ahora, si el usuario se crea, asumimos que la navegación es el comportamiento deseado.
                alert('Registro procesado. Serás redirigido a la página de inicio de sesión.');
                navigate('/login');
            }
            // Si tu servicio `register` lanza un error en caso de fallo, el bloque catch lo manejará.
            // Si simplemente devuelve un objeto sin `success: true` y el usuario se crea,
            // la lógica anterior podría necesitar ajustes basados en la respuesta real de `register`.

        } catch (err) {
            // Captura errores de red o excepciones lanzadas por `authService.register`
            console.error('Error durante el registro:', err);
            setError(err.message || 'Ocurrió un error inesperado durante el registro. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false); // Indicar que el proceso ha terminado
        }
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
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre de usuario"
                            required
                            disabled={isLoading}
                        />

                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Crea una contraseña segura"
                            required
                            disabled={isLoading}
                        />

                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu.email@ejemplo.com"
                            required
                            disabled={isLoading}
                        />

                        <label htmlFor="confirmEmail">Confirmar Correo Electrónico</label>
                        <input
                            id="confirmEmail"
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            placeholder="Confirma tu email"
                            required
                            disabled={isLoading}
                        />

                        {/* reCAPTCHA - Asegúrate de reemplazar 'your-site-key' con tu clave real
                            y de implementar la lógica de verificación del reCAPTCHA si es necesario.
                            Esto es solo un placeholder visual. */}
                        <div className="captcha" style={{ margin: '15px 0', textAlign: 'center' }}>
                            <p style={{fontSize: '0.8em', color: '#777'}}>[Espacio para reCAPTCHA]</p>
                            {/* <div className="g-recaptcha" data-sitekey="your-site-key"></div> */}
                        </div>

                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                        </button>
                    </form>
                    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
                    <p style={{ marginTop: '15px' }}>
                        ¿Ya tienes una cuenta? <Link to="/login" className="auth-link">Iniciar sesión</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Register;
