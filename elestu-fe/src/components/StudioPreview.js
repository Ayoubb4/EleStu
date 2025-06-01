import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';

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
        <div className="service-preview-page"> {/* Keeping the class name as 'service-preview-page' for existing CSS to apply */}
            <Navbar />
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
                                <p>Location</p>
                                <img src="https://www.flaticon.com/svg/v.icon/icons/svg/1057/1057630.svg" alt="Location Icon" className="location-icon" />
                                <p>{studio.location.address}</p>
                            </div>

                            <button className="hire-button" onClick={handleHireClick}>HIRE</button>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="service-description-title">Service Description</h2> {/* Keeping as "Service Description" as it's a description of the service offered by the studio */}
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