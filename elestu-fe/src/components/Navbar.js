// src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';
import logoGif from '../images/logoGif.gif';
// AÑADIDO: Iconos para el menú (hamburguesa y X para cerrar)
import { Settings, Menu, X } from 'lucide-react';

function Navbar() {
    const location = useLocation();

    // AÑADIDO: Estado para controlar si el menú móvil está abierto o cerrado
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Lógica para no mostrar enlaces en páginas de login/registro
    const authPaths = ['/login', '/register', '/forgot-password'];
    const showNavContent = !authPaths.includes(location.pathname);

    // Lógica para el efecto "blurred"
    const isStudiosPage = location.pathname.startsWith('/studios') || location.pathname.startsWith('/studio-preview') || location.pathname.startsWith('/booking-form');

    // AÑADIDO: Función para cerrar el menú al hacer clic en un enlace
    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            {/* AÑADIDO: Botón de menú hamburguesa (solo visible en móvil) */}
            {showNavContent && (
                <button className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
                </button>
            )}

            {/* El logo siempre está centrado */}
            <Link to={showNavContent ? "/services" : "/login"} className="navbar-logo-link" onClick={handleLinkClick}>
                <img src={logoGif} alt="Logo" className="navbar-logo" />
            </Link>

            {/* Contenido de la navegación (escritorio y móvil) */}
            {showNavContent && (
                // AÑADIDO: clase 'active' para mostrar/ocultar el menú desplegable
                <div className={`navbar-content ${isMenuOpen ? 'active' : ''}`}>
                    <div className="nav-links">
                        <Link to="/services" className={isStudiosPage ? 'blurred' : ''} onClick={handleLinkClick}>
                            Services
                        </Link>
                        <Link to="/studios" className={!isStudiosPage ? 'blurred' : ''} onClick={handleLinkClick}>
                            Studios
                        </Link>
                        {/* AÑADIDO: El enlace de Ajustes ahora también está en el menú móvil */}
                        <Link to="/settings" className="settings-link-mobile" onClick={handleLinkClick}>
                            <Settings size={22} />
                            <span>Settings</span>
                        </Link>
                    </div>
                    {/* El icono de ajustes original solo para escritorio */}
                    <Link to="/settings" className="settings-link-desktop">
                        <Settings className="settings-icon" />
                    </Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;