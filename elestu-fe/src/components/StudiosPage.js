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

                // --- MEJORADO: Manejo de errores más específico ---
                if (!response.ok) {
                    // Si el error es del cliente (ej. 400), puede que el backend diera un error de Google
                    if (response.status >= 400 && response.status < 500) {
                        const errorData = await response.json().catch(() => ({})); // Intenta parsear JSON, si no, objeto vacío
                        throw new Error(errorData.message || `Error del servidor: ${response.status}`);
                    }
                    // Si es un error del servidor (ej. 500), es un problema del backend
                    throw new Error(`No se pudo conectar con el servidor (código: ${response.status}).`);
                }

                const data = await response.json();

                // --- MODIFICADO: Mapeamos la dirección a una propiedad 'address' dedicada ---
                const formattedStudios = data.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    // Añadimos una descripción genérica y una propiedad 'address'
                    description: `Estudio de grabación profesional en la zona de ${place.name}.`,
                    address: place.formatted_address || 'Dirección no disponible', // Propiedad dedicada para la dirección
                    imageUrl: place.photoUrl || 'https://placehold.co/400x200/cccccc/000000?text=No+Image',
                    price: 200,
                    location: place.location,
                }));
                setStudios(formattedStudios);

            } catch (err) {
                console.error('Error fetching studios:', err);
                // --- MEJORADO: Diferenciamos el error de red ---
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
                <Loader /> // Usamos el nuevo componente de carga
            ) : error ? (
                // --- AÑADIDO: Un contenedor de error más vistoso ---
                <div className="error-container">
                    <h3>¡Vaya! Algo ha salido mal</h3>
                    <p>{error}</p>
                    <button onClick={clearSearch} className="city-clear-button">Volver a intentar</button>
                </div>
            ) : studios.length > 0 ? (
                <div className="studio-grid">
                    {studios.map((studio) => (
                        <div
                            key={studio.id}
                            className="studio-card"
                            onClick={() => handleStudioCardClick(studio)}
                            style={{ cursor: 'pointer' }}
                        >
                            <img
                                src={studio.imageUrl}
                                alt={studio.name}
                                className="studio-card-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://placehold.co/400x200/cccccc/000000?text=No+Image`;
                                }}
                            />
                            <div className="studio-card-info">
                                <h3 className="studio-card-title">{studio.name}</h3>
                                {/* --- AÑADIDO: Mostramos la dirección debajo del título --- */}
                                <p className="studio-card-address">
                                    <span role="img" aria-label="pin">📍</span> {studio.address}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="error-container">
                    <h3>No se encontraron resultados</h3>
                    <p>No hemos encontrado estudios para "{searchedTerm}".</p>
                    <button onClick={clearSearch} className="city-clear-button">Buscar en toda España</button>
                </div>
            )}
        </div>
    );
}

export default StudiosPage;