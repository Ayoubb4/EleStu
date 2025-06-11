// src/components/ServicePreview.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';

// --- AÑADIDO: URL de la API para las peticiones ---
const API_URL = process.env.REACT_APP_API_URL;

function ServicePreview() {
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    // --- AÑADIDO: Estado para saber si el usuario actual es el dueño del servicio ---
    const [isOwner, setIsOwner] = useState(false);

    useEffect(function () {
        const data = localStorage.getItem('currentService');
        if (!data) {
            navigate('/services');
        } else {
            const parsedService = JSON.parse(data);
            setService(parsedService);
            // --- AÑADIDO: Comprobamos si el usuario es el dueño ---
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

    // --- AÑADIDO: Función para navegar a la página de edición ---
    function handleEditClick() {
        // Pasamos el servicio completo al estado de la navegación para no tener que volver a cargarlo
        navigate(`/edit-service/${service.id}`, { state: { service } });
    }

    // --- AÑADIDO: Función para eliminar el servicio ---
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
                        {/* --- AÑADIDO: Botones de Editar y Eliminar para el propietario --- */}
                        {isOwner && (
                            <div className="owner-actions">
                                <button className="edit-button" onClick={handleEditClick}>Editar Servicio</button>
                                <button className="delete-button" onClick={handleDeleteClick}>Eliminar Servicio</button>
                            </div>
                        )}
                    </div>

                    <div className="preview-description-card">
                        <h2>Descripción del Servicio</h2>
                        <p>{service.description}</p>

                        <h3>Incluye:</h3>
                        {/* El resto del código de la descripción se mantiene igual */}
                        {service.serviceType === 'Cantante' && ( <ul>...</ul> )}
                        {service.serviceType === 'Productor' && ( <ul>...</ul> )}
                        {/* ... etc ... */}
                        {(!service.serviceType || service.serviceType === 'Otro') && (
                            <p>
                                Este servicio incluye una dedicación profesional y personalizada para cumplir con los objetivos de tu proyecto musical. Contacta para más detalles específicos.
                            </p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ServicePreview;