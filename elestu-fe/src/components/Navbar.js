//src/components/Navbar.js
import React from 'react';
import '../App.css';
import logoGif from '../images/logoGif.gif';
import { Settings } from 'lucide-react';

function Navbar() {
    return (
        <nav className="navbar">
            <img src={logoGif} alt="Logo" className="navbar-logo" />

            <div className="navbar-content"> {/* Este div contiene los enlaces y el icono de ajustes */}
                <div className="nav-links">
                    <a href="/services">Services</a>
                    <a href="/studios">Studios</a>
                </div>
                {/* Envolvemos el icono de ajustes en un enlace <a> */}
                <a href="/settings" className="settings-link">
                    <Settings className="settings-icon" />
                </a>
            </div>
        </nav>
    );
}

export default Navbar;