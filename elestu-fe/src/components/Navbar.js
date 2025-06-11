// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';
import logoGif from '../images/logoGif.gif';
// --- MODIFICADO: Añadimos el icono de Usuario ---
import { Settings, Menu, X, User } from 'lucide-react';

function Navbar() {
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const authPaths = ['/login', '/register', '/forgot-password'];
    const showNavContent = !authPaths.includes(location.pathname);

    const isStudiosPage = location.pathname.startsWith('/studios') || location.pathname.startsWith('/studio-preview') || location.pathname.startsWith('/booking-form');

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            {showNavContent && (
                <button className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
                </button>
            )}

            <Link to={showNavContent ? "/services" : "/login"} className="navbar-logo-link" onClick={handleLinkClick}>
                <img src={logoGif} alt="Logo" className="navbar-logo" />
            </Link>

            {showNavContent && (
                <div className={`navbar-content ${isMenuOpen ? 'active' : ''}`}>
                    {/* --- REORGANIZADO Y AÑADIDO: Ahora Perfil y Ajustes son enlaces principales --- */}
                    <div className="nav-links">
                        <Link to="/services" className={isStudiosPage ? 'blurred' : ''} onClick={handleLinkClick}>
                            Services
                        </Link>
                        <Link to="/studios" className={!isStudiosPage ? 'blurred' : ''} onClick={handleLinkClick}>
                            Studios
                        </Link>

                        {/* AÑADIDO: Enlace directo a Perfil */}
                        <Link to="/profile" className="nav-action-link" onClick={handleLinkClick}>
                            <User size={22} />
                            <span>Perfil</span>
                        </Link>

                        {/* AÑADIDO: Enlace de Ajustes unificado */}
                        <Link to="/settings" className="nav-action-link" onClick={handleLinkClick}>
                            <Settings size={22} />
                            <span>Ajustes</span>
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar;