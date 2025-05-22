import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';

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
    }, [navigate]);

    // NUEVO: Función para manejar el clic en el botón "HIRE"
    function handleHireClick() {
        // Opcional: Puedes guardar el servicio actual en localStorage de nuevo si la página de pago lo necesita
        localStorage.setItem('currentServiceForPayment', JSON.stringify(service));
        navigate('/payment-method'); // Redirige a la nueva página de métodos de pago
    }

    if (!service) return null;

    return (
        <div className="service-preview-page">
            <Navbar />
            <div className="service-detail-container">
                <div className="service-detail">
                    <img src={service.image || "https://placehold.co/600x400/0038E1/FFFFFF?text=Service+Image"} alt="Servicio" className="service-detail-image" />

                    <div className="service-detail-info-and-actions">
                        <div className="service-detail-info">
                            <div className="price-box">
                                <p>Price per Hour</p>
                                <p>{service.price}€</p>
                            </div>

                            <div className="service-type-box">
                                <p>SERVICE</p>
                                <h4>{service.title.toUpperCase()}</h4>
                            </div>

                            {/* MODIFICADO: Añadido el onClick handler */}
                            <button className="hire-button" onClick={handleHireClick}>HIRE</button>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="service-description-title">Service Description</h2>
            <div className="service-description-box">
                <p>{service.description}</p>
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
