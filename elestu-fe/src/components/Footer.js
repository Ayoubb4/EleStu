// src/components/Footer.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaInstagram, FaTiktok, FaSpotify } from 'react-icons/fa'; // Importamos los iconos
import { logout } from '../services/authService'; // Importamos la función de logout
import '../App.css';

function Footer() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        alert('Has cerrado sesión.');
        navigate('/login');
        window.location.reload();
    };

    return (
        <footer className="site-footer">
            <div className="footer-content">
                {/* --- Columna de Copyright --- */}
                <div className="footer-section copyright-section">
                    <p>™️</p>
                    <p>All Rights Reserved to @elestu777</p>
                </div>

                {/* --- Columna de Redes Sociales --- */}
                <div className="footer-section social-section">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaInstagram className="social-icon" />
                        <span>@elestu777</span>
                    </a>
                    <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaTiktok className="social-icon" />
                        <span>@elestu777</span>
                    </a>
                    <a href="https://spotify.com" target="_blank" rel="noopener noreferrer" className="social-link">
                        <FaSpotify className="social-icon" />
                        <span>@elestu777</span>
                    </a>
                </div>

                {/* --- Columna de Enlaces de Navegación --- */}
                <div className="footer-section links-section">
                    <div className="links-column">
                        <Link to="/services">Services</Link>
                        <Link to="/studios">Studios</Link>
                    </div>
                    <div className="links-column">
                        {/* El botón de logout llama a la función handleLogout */}
                        <button onClick={handleLogout} className="footer-logout-button">Log Out</button>
                        <Link to="/settings">Settings</Link>
                    </div>
                </div>

                {/* --- Columna de Contacto --- */}
                <div className="footer-section contact-section">
                    <div className="contact-box">
                        <p className="contact-title">Contact Us:</p>
                        <a href="mailto:elestu@gmail.com" className="contact-email">elestu@gmail.com</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;