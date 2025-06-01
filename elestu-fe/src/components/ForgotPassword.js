import React, { useState } from 'react';
import { forgotPassword } from '../services/authService'; // Assuming this path is correct
import { Link } from 'react-router-dom'; // Assuming react-router-dom is installed
import '../App.css'; // Make sure your App.css is correctly linked and contains the new styles
import logoGif from '../images/logoGif.gif'; // Keep this import for the Navbar component

// Define the Navbar component here, as it's provided in the user's latest input
// In a real application, this would ideally be in its own separate file (e.g., Navbar.jsx)
function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                {/* Only the logo will be displayed */}
                <img src={logoGif} alt="Logo" className="navbar-logo" />
                {/* Removed: <div className="nav-links"> */}
                {/* Removed: <a href="/services">Services</a> */}
                {/* Removed: <a href="/studios">Studios</a> */}
                {/* Removed: </div> */}
                {/* Removed: <Settings className="settings-icon" /> */}
            </div>
        </nav>
    );
}


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
            // Your actual API call for forgot password
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

    return (
        <div className="forgot-password-page-container">
            {/* Render the Navbar component here */}
            <Navbar />

            {/* Main content wrapper to center the form box */}
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

                        {/* Message and Error display */}
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

                        {/* Buttons container */}
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
    );
}

export default ForgotPassword;
