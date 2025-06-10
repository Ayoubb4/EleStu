// src/components/Services.js
import React, { useState, useEffect } from 'react';
import '../App.css';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

function Services() {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    function handleAddServiceClick() {
        navigate('/add-service');
    }

    function handleServiceClick(service) {
        // Guardamos el objeto de servicio completo, que ya incluye el 'serviceType'
        localStorage.setItem('currentService', JSON.stringify(service));
        navigate('/service-preview');
    }

    useEffect(() => {
        async function fetchServices() {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/services`);
                if (!response.ok) {
                    throw new Error('No se pudo conectar con el servidor.');
                }
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Error fetching services:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchServices();
    }, []);

    return (
        <div className="services-page">
            <Navbar />
            <div className="hero-section">
                <div className="hero-overlay">
                    <h2>¿Qué estás buscando?</h2>
                    <p>
                        La sección de Servicios de EleStu te permite contratar músicos,
                        productores e ingenieros de sonido. Encuentra y ofrece
                        servicios musicales de forma intuitiva y visualmente atractiva.
                    </p>
                </div>
            </div>

            <div className="services-title-container">
                <h1 className="services-main-title">Servicios Disponibles</h1>
            </div>

            {loading ? (
                <p className="services-info-message">Cargando servicios...</p>
            ) : error ? (
                <p className="services-info-message error">{error}</p>
            ) : (
                <div className="card-grid">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div className="card" key={service.id} onClick={() => handleServiceClick(service)}>
                                <div className="card-image-container">
                                    <img
                                        src={service.image || 'https://placehold.co/400x300/13254e/FFFFFF?text=EleStu'}
                                        alt={service.title}
                                    />
                                </div>
                                <div className="card-info">
                                    <h3>{service.title}</h3>
                                    <p className="card-description">{service.user?.name || 'Artista verificado'}</p>
                                    <p className="card-price">{service.price}€</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-services-message">
                            <h2>¡Aún no hay servicios!</h2>
                            <p>Sé el primero en marcar la diferencia. Crea un servicio y ponte activo.</p>
                            <button className="add-first-service-btn" onClick={handleAddServiceClick}>
                                Ofrecer mi Primer Servicio
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button className="add-service-btn" onClick={handleAddServiceClick}>
                +
            </button>
        </div>
    );
}

export default Services;
