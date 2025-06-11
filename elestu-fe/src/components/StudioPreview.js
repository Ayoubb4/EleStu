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
                    <h1 className="preview-title">{studio.name}</h1>
                    {/* --- MODIFICADO: Usamos studio.address para la ubicación --- */}
                    <p className="preview-provider">Ubicado en: {studio.address || 'Ubicación no especificada'}</p>
                </div>
            </header>

            <main className="preview-main-content">
                <div className="preview-image-container">
                    <img src={studio.imageUrl || "https://placehold.co/800x500/1a202c/FFFFFF?text=Estudio"} alt={studio.name} className="preview-image" />
                </div>

                <div className="preview-details-container">
                    <div className="preview-info-card">
                        <div className="info-card-item price">
                            <span>Precio por Hora</span>
                            <p>{studio.price}€</p>
                        </div>
                        <div className="info-card-item type">
                            <span>Tipo</span>
                            <p>ESTUDIO DE GRABACIÓN</p>
                        </div>
                        <button className="hire-button" onClick={handleHireClick}>
                            RESERVAR AHORA
                        </button>
                    </div>

                    <div className="preview-description-card">
                        <h2>Ubicación y Detalles</h2>
                        {/* --- MODIFICADO: Mostramos la dirección real aquí también --- */}
                        <p className="studio-full-address">{studio.address}</p>

                        <h3>Equipamiento Principal:</h3>
                        <ul>
                            <li>Consola de mezcla analógica/digital</li>
                            <li>Monitores de estudio de alta fidelidad</li>
                            <li>Selección de micrófonos de condensador y dinámicos</li>
                            <li>Cabina de grabación tratada acústicamente</li>
                            <li>Software de producción (DAW) estándar</li>
                            <li>Disponibilidad de instrumentos base</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default StudioPreview;