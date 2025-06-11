// src/components/ServicePreview.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL;

const serviceIncludesData = {
    'Cantante': [
        'Voz principal para maquetas o producciones finales.',
        'Grabación de coros y armonías vocales.',
        'Interpretación en el estilo musical que requiera el proyecto.',
        'Entrega de pistas de voz limpias y sin procesar (formato .wav).',
    ],
    'Productor': [
        'Creación de un arreglo musical completo desde cero.',
        'Producción y selección de instrumentación virtual o real.',
        'Asesoramiento en la estructura y composición de la canción.',
        'Entrega de una pre-mezcla de la producción.',
    ],
    'Guitarrista': [
        'Grabación de guitarras rítmicas y solistas.',
        'Creación de líneas de guitarra y riffs originales.',
        'Uso de guitarras eléctricas, acústicas o clásicas según se necesite.',
        'Pistas entregadas con y sin efectos aplicados.',
    ],
    'Musico de sesion': [
        'Grabación de pistas de batería acústica.',
        'Programación de baterías electrónicas y percusión.',
        'Creación de ritmos y fills personalizados para la canción.',
        'Sonido profesional adaptado al género musical.',
    ],
    'Compositor': [
        'Mezcla profesional de hasta 48 pistas.',
        'Mastering para plataformas de streaming (Spotify, Apple Music).',
        'Revisión y feedback técnico sobre la producción.',
        'Entrega en formato de alta calidad .wav y .mp3.',
    ],
};

// --- AÑADIDO: Componente para renderizar la lista de "Incluye" ---
const ServiceIncludes = ({ serviceType }) => {
    const includesList = serviceIncludesData[serviceType];

    if (includesList && includesList.length > 0) {
        return (
            <ul>
                {includesList.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    }

    // --- Texto por defecto si el tipo de servicio no está en la lista o es "Otro" ---
    return (
        <p>
            Este servicio incluye una dedicación profesional y personalizada para cumplir con los objetivos de tu proyecto musical. Contacta para más detalles específicos.
        </p>
    );
};


function ServicePreview() {
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(function () {
        const data = localStorage.getItem('currentService');
        if (!data) {
            navigate('/services');
        } else {
            const parsedService = JSON.parse(data);
            setService(parsedService);
            const userId = localStorage.getItem('userid');
            if (userId && parsedService.user && parsedService.user.id === parseInt(userId, 10)) {
                setIsOwner(true);
            }
        }
    }, [navigate]);

    function handleHireClick() {
        localStorage.setItem('currentServiceForPayment', JSON.stringify(service));
        navigate('/payment-method');
    }

    function handleEditClick() {
        navigate(`/edit-service/${service.id}`, { state: { service } });
    }

    async function handleDeleteClick() {
        if (window.confirm('¿Estás seguro de que quieres eliminar este servicio? Esta acción no se puede deshacer.')) {
            try {
                const authToken = localStorage.getItem('authToken');
                const response = await fetch(`${API_URL}/services/${service.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('No se pudo eliminar el servicio.');
                }

                alert('Servicio eliminado correctamente.');
                navigate('/services');

            } catch (error) {
                console.error('Error al eliminar el servicio:', error);
                alert(`Error: ${error.message}`);
            }
        }
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
                    <p className="preview-provider">Ofrecido por: {service.user?.name || 'Artista verificado'}</p>
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
                            <p>{service.serviceType?.toUpperCase() || 'GENERAL'}</p>
                        </div>
                        <button className="hire-button" onClick={handleHireClick}>
                            CONTRATAR AHORA
                        </button>
                    </div>

                    {/* --- MODIFICADO: Botones de Editar y Eliminar movidos fuera de la tarjeta --- */}
                    {isOwner && (
                        <div className="owner-actions">
                            <button className="edit-button" onClick={handleEditClick}>Editar Servicio</button>
                            <button className="delete-button" onClick={handleDeleteClick}>Eliminar Servicio</button>
                        </div>
                    )}

                    <div className="preview-description-card">
                        <h2>Descripción del Servicio</h2>
                        <p>{service.description}</p>

                        <h3>Incluye:</h3>
                        <ServiceIncludes serviceType={service.serviceType} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ServicePreview;