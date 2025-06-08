// src/components/Navbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Importar Link y useLocation
import '../App.css';
import logoGif from '../images/logoGif.gif';
import { Settings } from 'lucide-react';

function Navbar() {
    // Usamos el hook useLocation para obtener la ruta actual
    const location = useLocation();

    // Definimos las rutas donde NO queremos que aparezcan los enlaces principales
    const authPaths = ['/login', '/register', '/forgot-password'];

    // Verificamos si la ruta actual está en la lista de rutas de autenticación
    const showNavContent = !authPaths.includes(location.pathname);

    // Lógica para el efecto "blurred" que ya tenías
    const isStudiosPage = location.pathname.startsWith('/studios') || location.pathname.startsWith('/studio-preview') || location.pathname.startsWith('/booking-form');

    return (
        <nav className="navbar">
            {/* El logo siempre es visible y enlaza a la página principal si ya estás logueado, o al login si no */}
            <Link to={showNavContent ? "/services" : "/login"} className="navbar-logo-link">
                <img src={logoGif} alt="Logo" className="navbar-logo" />
            </Link>

            {/* --- AÑADIDO: Lógica para mostrar/ocultar los enlaces --- */}
            {/* El contenido de la derecha (Services, Studios, Settings) solo se muestra si showNavContent es true */}
            {showNavContent && (
                <div className="navbar-content">
                    <div className="nav-links">
                        <Link
                            to="/services"
                            className={isStudiosPage ? 'blurred' : ''}
                        >
                            Services
                        </Link>
                        <Link
                            to="/studios"
                            className={!isStudiosPage ? 'blurred' : ''}
                        >
                            Studios
                        </Link>
                    </div>
                    <Link to="/settings" className="settings-link">
                        <Settings className="settings-icon" />
                    </Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar;
