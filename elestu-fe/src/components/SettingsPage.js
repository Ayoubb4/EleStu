// src/components/SettingsPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { logout } from '../services/authService';
import '../App.css'; // Asegúrate de que los estilos están aquí

function SettingsPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Llama a la función de logout centralizada
        alert('Has cerrado sesión correctamente.');
        navigate('/');
        window.location.reload(); // Refresca para asegurar que el estado se reinicie
    };

    // La lista de FAQs se mantiene igual
    const faqs = [
        { q: '1. Cuáles son los métodos de pago disponibles?', a: 'Aceptamos pagos con tarjeta de crédito/débito y otros métodos seguros.' },
        { q: '2. Hay comisiones por usar EleStudios?', a: 'Sí, EleStudios cobra una pequeña comisión para cubrir costes operativos y garantizar la seguridad de los pagos.' },
        { q: '3. Puedo obtener un reembolso si el servicio no se ha realizado correctamente?', a: 'Si hay algún problema con el servicio, puedes abrir una disputa y nuestro equipo de soporte revisará el caso.' },
        { q: '4. Hay impuestos adicionales en los pagos?', a: 'Dependiendo de tu ubicación, pueden aplicarse impuestos adicionales. En el desglose del pago verás todos los costes.' },
        { q: '5. Es seguro pagar a través de EleStudios?', a: 'Sí, utilizamos pasarelas de pago seguras y cifrado de datos para proteger tu información.' },
    ];

    return (
        <div className="settings-page">
            <Navbar />
            <h1 className="settings-title-main">Settings</h1>

            <div className="settings-options-container">
                {/* --- AÑADIDO: Botón para ir a Mis Reservas --- */}
                <div className="settings-option">
                    <span className="settings-option-label">Mis Reservas</span>
                    <button
                        className="change-button"
                        onClick={() => navigate('/reservations')}
                    >
                        Ver
                    </button>
                </div>
                {/* --- FIN DE LA ADICIÓN --- */}

                <div className="settings-option">
                    <span className="settings-option-label">Change Email & Password</span>
                    <button
                        className="change-button"
                        onClick={() => navigate('/change-email-password')}
                    >
                        Change
                    </button>
                </div>
                <div className="settings-option">
                    <span className="settings-option-label">Change Personal Data</span>
                    <button
                        className="change-button"
                        onClick={() => navigate('/change-personal-data')}
                    >
                        Change
                    </button>
                </div>
            </div>

            {/* --- SECCIÓN DE PREGUNTAS FRECUENTES --- */}
            <section className="faq-section-settings">
                <h2>Preguntas Frecuentes</h2>
                <div className="faq-scroll-container">
                    {faqs.map((faq, index) => (
                        <div key={index} className="faq-item">
                            <h3>{faq.q}</h3>
                            <p>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- BOTÓN DE CERRAR SESIÓN --- */}
            <div className="logout-button-container">
                <button className="logout-button-large" onClick={handleLogout}>
                    Log Out
                </button>
            </div>
        </div>
    );
}

export default SettingsPage;