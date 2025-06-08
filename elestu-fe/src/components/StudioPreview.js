// src/components/StudioPreview.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';
import locationPin from '../images/location-pin.png';

function StudioPreview() {
    const navigate = useNavigate();
    const location = useLocation();
    const [studio, setStudio] = useState(null);

    useEffect(() => {
        // Asegúrate de que 'location.state' y 'location.state.studio' existen
        if (!location.state || !location.state.studio) {
            console.error("No se encontraron datos del estudio. Redirigiendo...");
            navigate('/studios'); // Si no hay datos, vuelve a la página de estudios
        } else {
            setStudio(location.state.studio);
        }
    }, [navigate, location.state]);

    // --- FUNCIÓN MODIFICADA ---
    function handleHireClick() {
        // --- LÓGICA AÑADIDA ---
        // 1. Verificamos si el usuario ha iniciado sesión buscando 'userid' en localStorage
        const userId = localStorage.getItem('userid');

        if (userId) {
            // 2. Si el usuario SÍ ha iniciado sesión, lo dejamos continuar a la página de reserva
            console.log(`Usuario con ID ${userId} va a reservar el estudio:`, studio.name);
            navigate('/booking-form', { state: { studio } });
        } else {
            // 3. Si el usuario NO ha iniciado sesión, le mostramos una alerta y lo redirigimos al login
            alert('Por favor, inicia sesión para poder hacer una reserva.');
            navigate('/login');
        }
        // --- FIN DE LA LÓGICA AÑADIDA ---
    }

    // Si aún no se ha cargado el estudio, no renderices nada o muestra un 'cargando...'
    if (!studio) {
        return (
            <div className="service-preview-page">
                <Navbar />
                <p>Cargando información del estudio...</p>
            </div>
        );
    }


    return (
        <div className="service-preview-page">
            <Navbar />
            <div className="service-detail-container">
                <div className="service-detail">
                    <img src={studio.imageUrl || "https://placehold.co/600x400/0038E1/FFFFFF?text=Studio+Image"} alt="Estudio de Grabación" className="service-detail-image" />

                    <div className="service-detail-info-and-actions">
                        <div className="service-detail-info">
                            <div className="price-box">
                                <p>Precio por Hora</p>
                                <p>{studio.price}€</p> {/* Ajustado a € como en otros componentes */}
                            </div>

                            <div className="location-box">
                                <p>Ubicación</p>
                                <img src={locationPin} alt="Location Icon" className="location-icon" />
                                <p>{studio.location?.address || 'No disponible'}</p>
                            </div>

                            <button className="hire-button" onClick={handleHireClick}>HIRE</button>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="service-description-title">Descripción del Estudio</h2>
            <div className="service-description-box">
                <p>{studio.description}</p>
                <p>
                    <strong>Equipamiento y Características:</strong>
                    <br />
                    - Balance preciso de cada pista para lograr claridad y profundidad.
                    <br />
                    - Ecualización avanzada para resaltar frecuencias clave y eliminar
                    resonancias no deseadas.
                    <br />
                    - Compresión y dinámica para dar coherencia y pegada a la mezcla.
                    <br />
                    - Procesamiento de efectos (reverbs, delays, modulación) para crear
                    ambiente y espacialidad.
                    <br />
                    - Automatización detallada para un sonido dinámico y envolvente.
                    <br />
                    - Masterización de alta calidad.
                </p>
            </div>
        </div>
    );
}

export default StudioPreview;