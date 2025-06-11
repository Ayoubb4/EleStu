// src/components/StudiosPage.js
import React, { useState, useEffect } from 'react';
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

    // --- AÑADIDO: Estados para manejar la búsqueda por ciudad ---
    const [cityInput, setCityInput] = useState(''); // El texto que el usuario escribe
    const [searchQuery, setSearchQuery] = useState(''); // La ciudad que se busca al pulsar el botón

    // --- MODIFICADO: useEffect ahora depende de 'searchQuery' ---
    useEffect(() => {
        const fetchStudiosFromBackend = async () => {
            try {
                setLoading(true);
                setError(null);

                // Construimos la URL con la ciudad si hay una búsqueda activa
                let url = `${API_URL}/studios`;
                if (searchQuery) {
                    url += `?city=${encodeURIComponent(searchQuery)}`;
                }

                const response = await fetch(url);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch studios from backend.');
                }

                const data = await response.json();

                // Formateamos los datos como antes
                const formattedStudios = data.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    description: place.formatted_address || 'Estudio de grabación.',
                    imageUrl: place.photoUrl || 'https://placehold.co/400x200/cccccc/000000?text=No+Image',
                    price: 200, // Precio de ejemplo
                    location: place.location, // Usamos la location de Google
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
    }, [searchQuery]); // El efecto se vuelve a ejecutar cada vez que cambia la búsqueda

    const handleStudioCardClick = (studio) => {
        navigate('/studio-preview', { state: { studio } });
    };

    // --- AÑADIDO: Manejador para el botón de búsqueda ---
    const handleSearch = () => {
        setSearchQuery(cityInput);
    };

    // --- AÑADIDO: Manejador para limpiar la búsqueda ---
    const clearSearch = () => {
        setCityInput('');
        setSearchQuery('');
    };

    return (
        <div className="studios-page-container">
            <Navbar />
            <StudioHeroSection />

            {/* --- AÑADIDO: Formulario de búsqueda de ciudad --- */}
            <div className="city-search-container">
                <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="Busca estudios en tu ciudad..."
                    className="city-search-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} className="city-search-button">Buscar</button>
                {searchQuery && (
                    <button onClick={clearSearch} className="city-clear-button">Mostrar Todos</button>
                )}
            </div>

            <h2 className="studios-grid-section-title">
                {searchQuery ? `Estudios de Grabación en ${searchQuery}` : 'Nuestros Estudios de Grabación en España'}
            </h2>

            {loading ? (
                <p style={{ textAlign: 'center', fontSize: '1.5rem', padding: '3rem' }}>Cargando Estudios...</p>
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
                    No se encontraron estudios para "{searchQuery}".
                </p>
            )}
        </div>
    );
}

export default StudiosPage;