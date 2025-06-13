// src/components/StudiosPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import StudioHeroSection from './StudioHeroSection';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL;

// --- AÑADIDO: Componente para la animación de carga (spinner) ---
const Loader = () => (
    <div className="loader-container">
        <div className="loader-spinner"></div>
        <p>Buscando estudios...</p>
    </div>
);

function StudiosPage() {
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [location, setLocation] = useState(null);
    const [searchedTerm, setSearchedTerm] = useState('España');

    const autocompleteInput = useRef(null);

    useEffect(() => {
        // Esta función se asegura de que el script de Google se haya cargado
        const initAutocomplete = () => {
            if (window.google && autocompleteInput.current) {
                const autocomplete = new window.google.maps.places.Autocomplete(
                    autocompleteInput.current,
                    {
                        types: ['(regions)'],
                        componentRestrictions: { 'country': 'es' },
                    }
                );
                autocomplete.addListener('place_changed', () => {
                    const place = autocomplete.getPlace();
                    if (place.geometry) {
                        const newLocation = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                        };
                        setLocation(newLocation);
                        setSearchedTerm(place.name);
                    }
                });
            } else {
                // Si el script aún no está, reintenta en 100ms
                setTimeout(initAutocomplete, 100);
            }
        };
        initAutocomplete();
    }, []);

    useEffect(() => {
        const fetchStudiosFromBackend = async () => {
            try {
                setLoading(true);
                setError(null);

                let url = `${API_URL}/studios`;
                if (location) {
                    url += `?lat=${location.lat}&lng=${location.lng}`;
                }

                const response = await fetch(url);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error del servidor: ${response.status}`);
                }

                const data = await response.json();

                // --- MODIFICADO: Adaptamos los datos al formato que espera la nueva tarjeta ---
                const formattedStudios = data.map(place => ({
                    id: place.place_id,
                    title: place.name, // 'name' ahora es 'title'
                    address: place.formatted_address || 'Dirección no disponible',
                    image: place.photoUrl || 'https://placehold.co/400x300/1e293b/ffffff?text=Estudio',
                    rating: place.rating, // Dato real de Google
                    reviews: place.user_ratings_total, // Dato real de Google
                    location: place.location,
                }));
                setStudios(formattedStudios);

            } catch (err) {
                console.error('Error fetching studios:', err);
                if (err instanceof TypeError && err.message === 'Failed to fetch') {
                    setError('Error de red. Por favor, comprueba tu conexión a internet.');
                } else {
                    setError(`Hubo un error al cargar los estudios: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStudiosFromBackend();
    }, [location]);

    const handleStudioCardClick = (studio) => {
        navigate('/studio-preview', { state: { studio } });
    };

    const clearSearch = () => {
        setLocation(null);
        setSearchedTerm('España');
        if(autocompleteInput.current) autocompleteInput.current.value = '';
    };

    return (
        <div className="studios-page-container">
            <Navbar />
            <StudioHeroSection />

            <div className="city-search-container">
                <input
                    ref={autocompleteInput}
                    type="text"
                    placeholder="Busca por ciudad, provincia o código postal..."
                    className="city-search-input"
                />
                {location && (
                    <button onClick={clearSearch} className="city-clear-button">Mostrar Todos</button>
                )}
            </div>

            <h2 className="studios-grid-section-title">
                {`Estudios de Grabación en ${searchedTerm}`}
            </h2>

            {loading ? (
                <Loader />
            ) : error ? (
                <div className="error-container">
                    <h3>¡Vaya! Algo ha salido mal</h3>
                    <p>{error}</p>
                    <button onClick={clearSearch} className="city-clear-button">Volver a intentar</button>
                </div>
            ) : studios.length > 0 ? (
                // --- MANTENEMOS la clase original 'studio-grid' y añadimos 'card-grid' ---
                <div className="studio-grid card-grid">
                    {studios.map((studio) => (
                        // --- MANTENEMOS la clase original 'studio-card' y añadimos 'card' ---
                        <div
                            key={studio.id}
                            className="studio-card card"
                            onClick={() => handleStudioCardClick(studio)}
                        >
                            {/* La estructura interna se reemplaza por el nuevo formato */}
                            <div className="card-image-container">
                                <img
                                    src={studio.image}
                                    alt={studio.title}
                                    className="studio-card-image" // Mantenemos la clase original por si acaso
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/1e293b/ffffff?text=Estudio'; }}
                                />
                                <div className="card-image-dots">
                                    <span className="dot active"></span>
                                    <span className="dot"></span>
                                    <span className="dot"></span>
                                </div>
                                <div className="card-heart-icon">♡</div>
                            </div>
                            <div className="studio-card-info card-info">
                                <h3 className="studio-card-title card-title">{studio.title}</h3>
                                {studio.rating > 0 && (
                                    <div className="card-rating">
                                        <span className="card-rating-star">★</span>
                                        <span className="card-rating-value">{studio.rating.toFixed(1)}</span>
                                        <span className="card-rating-reviews">({studio.reviews})</span>
                                    </div>
                                )}
                                <p className="studio-card-address card-address">
                                    <span role="img" aria-label="pin">📍</span> {studio.address}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="error-container">
                    <h3>No se encontraron resultados</h3>
                    <p>No hemos encontrado studios para "{searchedTerm}".</p>
                    <button onClick={clearSearch} className="city-clear-button">Buscar en toda España</button>
                </div>
            )}
        </div>
    );
}

export default StudiosPage;