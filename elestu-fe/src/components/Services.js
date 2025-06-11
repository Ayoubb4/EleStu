// src/components/Services.js
import React, { useState, useEffect } from 'react';
import '../App.css';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

// --- MODIFICADO: Lista de tipos de servicio actualizada para coincidir con el formulario ---
const SERVICE_TYPES = ['Todos', 'Cantante', 'Productor', 'DJ', 'Músico de Sesión', 'Compositor', 'Otro'];

function Services() {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // --- AÑADIDO: Estado para el filtro activo ---
    const [activeFilter, setActiveFilter] = useState('Todos');

    function handleAddServiceClick() {
        navigate('/add-service');
    }

    function handleServiceClick(service) {
        localStorage.setItem('currentService', JSON.stringify(service));
        navigate('/service-preview');
    }

    // --- MODIFICADO: useEffect ahora depende de 'activeFilter' y lo usa para la petición ---
    useEffect(() => {
        async function fetchServices() {
            try {
                setLoading(true);
                setError(null); // Resetea el error en cada nueva petición

                // Construimos la URL con el filtro si no es "Todos"
                let url = `${API_URL}/services`;
                if (activeFilter !== 'Todos') {
                    url += `?type=${activeFilter}`;
                }

                const response = await fetch(url);
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
    }, [activeFilter]); // Se ejecutará cada vez que cambie el filtro

    return (
        <div className="services-page">
            <Navbar />
            <div className="hero-section">
                <div className="hero-overlay">
                    <h2>Qué estás buscando?</h2>
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

            {/* --- AÑADIDO: Contenedor para los botones de filtro --- */}
            <div className="filter-container">
                {SERVICE_TYPES.map((type) => (
                    <button
                        key={type}
                        className={`filter-button ${activeFilter === type ? 'active' : ''}`}
                        onClick={() => setActiveFilter(type)}
                    >
                        {type}
                    </button>
                ))}
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
                                    {/* --- AÑADIDO: Etiqueta con el tipo de servicio sobre la imagen --- */}
                                    <span className="card-service-type-badge">{service.serviceType}</span>
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
                            <h2>No hay servicios para el filtro "{activeFilter}"</h2>
                            <p>Prueba a seleccionar otra categoría o sé el primero en ofrecer este tipo de servicio.</p>
                            <button className="add-first-service-btn" onClick={handleAddServiceClick}>
                                Ofrecer un Servicio
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