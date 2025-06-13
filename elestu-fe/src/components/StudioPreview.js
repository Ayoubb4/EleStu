// src/components/StudioPreview.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';

function StudioPreview() {
    const navigate = useNavigate();
    const location = useLocation();
    const [studio, setStudio] = useState(null);

    useEffect(() => {
        if (!location.state || !location.state.studio) {
            console.error("No se encontraron datos del estudio. Redirigiendo...");
            navigate('/studios');
        } else {
            setStudio(location.state.studio);
        }
    }, [navigate, location.state]);

    function handleHireClick() {
        const userId = localStorage.getItem('userid');
        if (userId) {
            localStorage.setItem('currentStudioForBooking', JSON.stringify(studio));
            navigate('/booking-form', { state: { studio } });
        } else {
            alert('Por favor, inicia sesión para poder hacer una reserva.');
            navigate('/login');
        }
    }

    if (!studio) {
        return (
            <div className="page-container">
                <Navbar />
                <p>Cargando información del estudio...</p>
            </div>
        );
    }

    return (
        <div className="service-preview-page">
            <Navbar />
            <header className="preview-header">
                <div className="preview-header-content">
                    {/* --- CORREGIDO: Usamos studio.title en lugar de studio.name --- */}
                    <h1 className="preview-title">{studio.title}</h1>
                    <p className="preview-provider">Ubicado en: {studio.address || 'Ubicación no especificada'}</p>
                </div>
            </header>

            <main className="preview-main-content">
                <div className="preview-image-container">
                    {/* --- CORREGIDO: Usamos studio.image en lugar de studio.imageUrl --- */}
                    <img src={studio.image || "https://placehold.co/800x500/1a202c/FFFFFF?text=Estudio"} alt={studio.title} className="preview-image" />
                </div>

                <div className="preview-details-container">
                    <div className="preview-info-card">
                        {/* --- MODIFICADO: Eliminada la sección de precio por hora --- */}

                        <div className="info-card-item type">
                            <span>Tipo</span>
                            <p>ESTUDIO DE GRABACIÓN</p>
                        </div>
                        <button className="hire-button" onClick={handleHireClick}>
                            CONTACTAR PARA RESERVAR
                        </button>
                    </div>

                    <div className="preview-description-card">
                        <h2>Ubicación y Detalles</h2>
                        <p className="studio-full-address">{studio.address}</p>

                        <h3>Equipamiento Principal (Ejemplo)</h3>
                        <ul>
                            <li>Consola de mezcla analógica/digital</li>
                            <li>Monitores de estudio de alta fidelidad</li>
                            <li>Selección de micrófonos de condensador y dinámicos</li>
                            <li>Cabina de grabación tratada acústicamente</li>
                            <li>Software de producción (DAW) estándar</li>
                            <li>Disponibilidad de instrumentos base</li>
                        </ul>
                        <p>
                            Contacta con el estudio para confirmar la disponibilidad del equipamiento y concretar los detalles de tu sesión.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default StudioPreview;