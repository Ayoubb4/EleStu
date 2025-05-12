import React from 'react';
import '../App.css';
import logoGif from '../images/logoGif.gif';

function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-content">
                <img src={logoGif} alt="Logo" className="navbar-logo" />
            </div>
        </nav>
    );
}

export default Navbar;
