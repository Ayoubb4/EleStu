//src/components/StudioPreview.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';
import locationPin from '../images/location-pin.png';


function StudioPreview() { // Renamed from ServicePreview to StudioPreview
    const navigate = useNavigate();
    const location = useLocation();
    const [studio, setStudio] = useState(null);

    useEffect(function () {
        const { studio } = location.state || {};
        if (!studio) {
            navigate('/studios');
        } else {
            setStudio(studio);
        }
    }, [navigate, location.state]);

    function handleHireClick() {
        navigate('/booking-form', { state: { studio } });
    }

    if (!studio) return null;

    return (
        <div className="service-preview-page">
            <Navbar /> {/* Tu componente Navbar manejará el logo, "Estudios" y el icono de ajustes */}
            <div className="service-detail-container">
                <div className="service-detail">
                    <img src={studio.imageUrl || "https://placehold.co/600x400/0038E1/FFFFFF?text=Studio+Image"} alt="Estudio de Grabación" className="service-detail-image" />

                    <div className="service-detail-info-and-actions">
                        <div className="service-detail-info">
                            <div className="price-box">
                                <p>Price per Hour</p>
                                <p>{studio.price}$</p>
                            </div>

                            <div className="location-box">
                                <p>Location</p> {/* Este <p> es para el texto "Location" */}
                                <img src={locationPin} alt="Location Icon" className="location-icon" />
                                <p>{studio.location.address}</p> {/* Este <p> es para la dirección */}
                            </div>

                            <button className="hire-button" onClick={handleHireClick}>HIRE</button>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="service-description-title">Service Description</h2>
            <div className="service-description-box">
                <p>{studio.description}</p>
                <p>
                    Mezcla profesional:
                    <br />
                    Balance preciso de cada pista para lograr claridad y profundidad.
                    <br />
                    Ecualización avanzada para resaltar frecuencias clave y eliminar
                    resonancias no deseadas.
                    <br />
                    Compresión y dinámica para dar coherencia y pegada a la mezcla.
                    <br />
                    Procesamiento de efectos (reverbs, delays, modulación) para crear
                    ambiente y espacialidad.
                    <br />
                    Automatización detallada para un sonido dinámico y envolvente.
                    <br />
                    ✦ Masterización de alta calidad:
                </p>
            </div>
        </div>
    );
}

export default StudioPreview;