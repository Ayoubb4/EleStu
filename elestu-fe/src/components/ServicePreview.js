import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Make sure this path is correct if App.css contains the new styles
import Navbar from './Navbar'; // Added Navbar import

function ServicePreview() {
    const navigate = useNavigate();
    const [service, setService] = useState(null);

    useEffect(function () {
        const data = localStorage.getItem('lastService');
        if (!data) {
            navigate('/services');
        } else {
            setService(JSON.parse(data));
        }
    }, []);

    if (!service) return null;

    return (
        <div className="service-preview-page"> {/* Added a wrapper div for the whole page */}
            <Navbar /> {/* Added Navbar */}
            <div className="service-detail-container"> {/* Main container for layout */}
                <div className="service-detail">
                    {/* Image Section - The large image in the preview */}
                    <img src={service.image} alt="Servicio" className="service-detail-image" />

                    <div className="service-detail-info-and-actions"> {/* New div to group info and actions */}
                        <div className="service-detail-info">
                            {/* Price Box */}
                            <div className="price-box">
                                <p>Price per Hour</p>
                                <p>{service.price}€</p> {/* Using service.price here */}
                            </div>

                            {/* Service Type Box */}
                            <div className="service-type-box">
                                <p>SERVICE</p>
                                <h4>{service.title.toUpperCase()}</h4> {/* Using service.title here */}
                            </div>

                            {/* Hire Button */}
                            <button className="hire-button">HIRE</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Description Section */}
            <h2 className="service-description-title">Service Description</h2>
            <div className="service-description-box">
                <p>{service.description}</p> {/* Using service.description here */}
                {/* You can add more detailed descriptions from your service object if available */}
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

export default ServicePreview;