// src/components/Services.js
import React, { useState, useEffect, useMemo } from 'react';
import '../App.css';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;
const SERVICE_TYPES = ['Todos', 'Cantante', 'Productor', 'DJ', 'Músico de Sesión', 'Compositor', 'Otro'];

// --- AÑADIDO: Icono de perfil genérico en formato SVG ---
const GENERIC_AVATAR = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' color='%239CA3AF'%3e%3cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3e%3c/svg%3e";

const generateRandomRating = () => {
    const rating = (Math.random() * (5.0 - 3.8) + 3.8).toFixed(1);
    const reviews = Math.floor(Math.random() * 250) + 1;
    return { rating, reviews };
};

function Services() {
    const navigate = useNavigate();
    const [allServices, setAllServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [sortOrder, setSortOrder] = useState('');

    function handleAddServiceClick() {
        navigate('/add-service');
    }

    function handleServiceClick(service) {
        localStorage.setItem('currentService', JSON.stringify(service));
        navigate('/service-preview');
    }

    useEffect(() => {
        async function fetchAllServices() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_URL}/services`);
                if (!response.ok) {
                    throw new Error('No se pudo conectar con el servidor.');
                }
                const data = await response.json();
                const servicesWithRatings = data.map(service => ({
                    ...service,
                    ...generateRandomRating()
                }));
                setAllServices(servicesWithRatings);
            } catch (error) {
                console.error('Error fetching services:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }
        fetchAllServices();
    }, []);

    const displayedServices = useMemo(() => {
        let filtered = allServices;

        if (activeFilter !== 'Todos') {
            filtered = allServices.filter(service => service.serviceType === activeFilter);
        }

        if (sortOrder) {
            filtered = [...filtered].sort((a, b) => {
                if (sortOrder === 'asc') {
                    return a.price - b.price;
                } else {
                    return b.price - a.price;
                }
            });
        }

        return filtered;
    }, [allServices, activeFilter, sortOrder]);


    return (
        <div className="services-page">
            <Navbar />
            <div className="hero-section">
                <div className="hero-overlay">
                    <h2>Qué estás buscando?</h2>
                    <p>
                        Encuentra y contrata a los mejores músicos, productores e ingenieros de sonido para llevar tu proyecto al siguiente nivel.
                    </p>
                </div>
            </div>

            <div className="services-title-container">
                <h1 className="services-main-title">Servicios Destacados</h1>
            </div>

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

            <div className="sort-container">
                <select
                    className="sort-select"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                >
                    <option value="">Ordenar por</option>
                    <option value="asc">Precio: más barato primero</option>
                    <option value="desc">Precio: más caro primero</option>
                </select>
            </div>


            {loading ? (
                <p className="services-info-message">Cargando servicios...</p>
            ) : error ? (
                <p className="services-info-message error">{error}</p>
            ) : (
                <div className="card-grid">
                    {displayedServices.length > 0 ? (
                        displayedServices.map((service) => (
                            <div className="card" key={service.id} onClick={() => handleServiceClick(service)}>
                                <div className="card-image-container">
                                    <img
                                        src={service.image || 'https://placehold.co/400x300/13254e/FFFFFF?text=EleStu'}
                                        alt={service.title}
                                    />
                                    <div className="card-image-dots">
                                        <span className="dot active"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                    <div className="card-heart-icon">♡</div>
                                </div>
                                <div className="card-info">
                                    <div className="card-user-info">
                                        {/* --- MODIFICADO: Se usa el avatar genérico si no hay foto --- */}
                                        <img src={service.user?.profilePicture || GENERIC_AVATAR} alt={service.user?.name} className="card-user-avatar" />
                                        <div className="card-user-details">
                                            {/* --- MODIFICADO: Quitada la bandera de México --- */}
                                            <span className="card-user-name">{service.user?.name || 'Artista Verificado'}</span>
                                            {/* --- MODIFICADO: Quitada la línea de "Level 2" --- */}
                                        </div>
                                    </div>
                                    <h3 className="card-title">{service.title}</h3>
                                    <div className="card-rating">
                                        <span className="card-rating-star">★</span>
                                        <span className="card-rating-value">{service.rating}</span>
                                        <span className="card-rating-reviews">({service.reviews})</span>
                                    </div>
                                    <p className="card-price">
                                        A partir de <span>{service.price} €</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-services-message">
                            <h2>No hay servicios para "{activeFilter}"</h2>
                            <p>Prueba a seleccionar otra categoría o sé el primero en ofrecer un servicio.</p>
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