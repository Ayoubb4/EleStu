import React from 'react';
import '../App.css'; // Removed -  We'll include the CSS directly
import logoGif from '../images/logoGif.gif';
import { Settings } from 'lucide-react';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <img src={logoGif} alt="Logo" className="navbar-logo" />
                <div className="nav-links">
                    <a href="/services">Services</a>
                    <a href="/studios">Studios</a>
                </div>
                <Settings className="settings-icon" />
            </div>
        </nav>
    );
}

export default Navbar;
