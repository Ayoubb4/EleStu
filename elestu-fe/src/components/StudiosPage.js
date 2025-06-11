// src/components/StudiosPage.js
import React, { useState, useEffect, useRef } from 'react'; // Añadido: useRef
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import StudioHeroSection from './StudioHeroSection';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL;

function StudiosPage() {
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --- MODIFICADO: El estado ahora guarda las coordenadas de la búsqueda ---
    const [location, setLocation] = useState(null); // Ej: { lat: 41.3851, lng: 2.1734 }
    const [searchedTerm, setSearchedTerm] = useState('España'); // Para mostrar el título

    // --- AÑADIDO: Referencia para el input del autocompletado ---
    const autocompleteInput = useRef(null);

    // --- AÑADIDO: Efecto para inicializar el autocompletado de Google ---
    useEffect(() => {
        if (window.google && autocompleteInput.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(
                autocompleteInput.current,
                {
                    types: ['(regions)'], // Busca ciudades, provincias, C.P., etc.
                    componentRestrictions: { 'country': 'es' }, // Limita a España
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
                    setSearchedTerm(place.name); // Actualizamos el título de la búsqueda
                }
            });
        }
    }, [loading]); // Se ejecuta una vez que `window.google` está disponible

    // --- MODIFICADO: useEffect ahora depende de 'location' para buscar ---
    useEffect(() => {
        const fetchStudiosFromBackend = async () => {
            try {
                setLoading(true);
                setError(null);

                let url = `${API_URL}/studios`;
                // Si tenemos coordenadas, las enviamos al backend
                if (location) {
                    url += `?lat=${location.lat}&lng=${location.lng}`;
                }

                const response = await fetch(url);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch studios from backend.');
                }

                const data = await response.json();

                const formattedStudios = data.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    description: place.formatted_address || 'Estudio de grabación.',
                    imageUrl: place.photoUrl || 'https://placehold.co/400x200/cccccc/000000?text=No+Image',
                    price: 200,
                    location: place.location,
                }));
                setStudios(formattedStudios);

            } catch (err) {
                console.error('Error fetching studios:', err);
                setError(`Hubo un error al cargar los estudios: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchStudiosFromBackend();
    }, [location]); // Se ejecuta cada vez que cambia la localización

    const handleStudioCardClick = (studio) => {
        navigate('/studio-preview', { state: { studio } });
    };

    // --- AÑADIDO: Manejador para limpiar la búsqueda y volver a España ---
    const clearSearch = () => {
        setLocation(null); // Al poner location a null, el useEffect busca en toda España
        setSearchedTerm('España');
        if(autocompleteInput.current) autocompleteInput.current.value = '';
    };

    return (
        <div className="studios-page-container">
            <Navbar />
            <StudioHeroSection />

            {/* --- MODIFICADO: Formulario de búsqueda con Autocompletado --- */}
            <div className="city-search-container">
                <input
                    ref={autocompleteInput} // Usamos la referencia
                    type="text"
                    placeholder="Busca por ciudad, provincia o código postal..."
                    className="city-search-input"
                />
                {/* El botón de buscar ya no es necesario, pero añadimos uno para limpiar */}
                {location && (
                    <button onClick={clearSearch} className="city-clear-button">Mostrar Todos</button>
                )}
            </div>

            <h2 className="studios-grid-section-title">
                {`Estudios de Grabación en ${searchedTerm}`}
            </h2>

            {loading ? (
                <p style={{ textAlign: 'center', fontSize: '1.5rem', padding: '3rem' }}>Buscando Estudios...</p>
            ) : error ? (
                <p style={{ textAlign: 'center', color: 'red', fontSize: '1.5rem' }}>{error}</p>
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
                                <p className="studio-card-description">{studio.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p style={{ textAlign: 'center', fontSize: '1.5rem', padding: '3rem' }}>
                    No se encontraron estudios para "{searchedTerm}".
                </p>
            )}
        </div>
    );
}

export default StudiosPage;