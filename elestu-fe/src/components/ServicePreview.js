// src/components/ServicePreview.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';

function ServicePreview() {
    const navigate = useNavigate();
    const [service, setService] = useState(null);

    useEffect(function () {
        const data = localStorage.getItem('currentService');
        if (!data) {
            navigate('/services');
        } else {
            setService(JSON.parse(data));
        }
    }, [navigate]);

    function handleHireClick() {
        localStorage.setItem('currentServiceForPayment', JSON.stringify(service));
        navigate('/payment-method');
    }

    if (!service) {
        return (
            <div className="page-container">
                <Navbar />
                <p>Cargando servicio...</p>
            </div>
        );
    }

    return (
        <div className="service-preview-page">
            <Navbar />
            <header className="preview-header">
                <div className="preview-header-content">
                    <h1 className="preview-title">{service.title}</h1>
                    <p className="preview-provider">Ofrecido por: <strong>{service.user?.name || 'Artista verificado'}</strong></p>
                </div>
            </header>

            <main className="preview-main-content">
                <div className="preview-image-container">
                    <img src={service.image || "https://placehold.co/800x500/cccccc/333333?text=Servicio"} alt={service.title} className="preview-image" />
                </div>

                <div className="preview-details-container">
                    <div className="preview-info-card">
                        <div className="info-card-item price">
                            <span>Precio Total</span>
                            <p>{service.price}€</p>
                        </div>
                        <div className="info-card-item type">
                            <span>Tipo de Servicio</span>
                            {/* --- AÑADIDO: Muestra el tipo de servicio dinámicamente --- */}
                            <p>{service.serviceType?.toUpperCase() || 'GENERAL'}</p>
                        </div>
                        <button className="hire-button" onClick={handleHireClick}>
                            CONTRATAR AHORA
                        </button>
                    </div>

                    <div className="preview-description-card">
                        <h2>Descripción del Servicio</h2>
                        <p>{service.description}</p>

                        {/* --- AÑADIDO: Contenido dinámico para la sección "Incluye" --- */}
                        <h3>Incluye:</h3>

                        {service.serviceType === 'Cantante' && (
                            <ul>
                                <li>Interpretación vocal para grabaciones o eventos</li>
                                <li>Adaptabilidad a diversos géneros musicales</li>
                                <li>Grabación de coros y armonías</li>
                                <li>Equipo vocal propio de alta calidad</li>
                            </ul>
                        )}

                        {service.serviceType === 'Productor' && (
                            <ul>
                                <li>Arreglos y composición de la estructura musical</li>
                                <li>Grabación, edición y mezcla de pistas</li>
                                <li>Masterización final para plataformas de streaming</li>
                                <li>Asesoramiento creativo durante todo el proceso</li>
                            </ul>
                        )}

                        {service.serviceType === 'DJ' && (
                            <ul>
                                <li>Sesiones en vivo para todo tipo de eventos</li>
                                <li>Amplio repertorio musical adaptable</li>
                                <li>Equipo de mezcla profesional propio</li>
                                <li>Creación de ambiente y energía para la pista de baile</li>
                            </ul>
                        )}

                        {service.serviceType === 'Músico de Sesión' && (
                            <ul>
                                <li>Grabación de instrumentos para tus producciones</li>
                                <li>Ejecución profesional y versátil</li>
                                <li>Disponibilidad para sesiones en estudio o remotas</li>
                                <li>Aportación de ideas y arreglos</li>
                            </ul>
                        )}

                        {service.serviceType === 'Compositor' && (
                            <ul>
                                <li>Creación de música original para artistas o medios</li>
                                <li>Composición de letras y melodías</li>
                                <li>Desarrollo de bandas sonoras y jingles</li>
                                <li>Adaptación a diferentes estilos y briefs creativos</li>
                            </ul>
                        )}

                        {(!service.serviceType || service.serviceType === 'Otro') && (
                            <p>
                                Este servicio incluye una dedicación profesional y personalizada para cumplir con los objetivos de tu proyecto musical. Contacta para más detalles específicos.
                            </p>
                        )}
                        {/* --- FIN DE LA ADICIÓN --- */}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ServicePreview;