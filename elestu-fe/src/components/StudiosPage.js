//src/components/StudiosPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import StudioHeroSection from './StudioHeroSection';
import '../App.css';

function StudiosPage() {
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudiosFromBackend = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('http://localhost:3000/api/studios');

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
                    location: {
                        address: "Avinguda de Roma, 50, L'Eixample, 08015 Barcelona",
                    }
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
    }, []);

    // **REQUIRED CHANGE HERE**
    const handleStudioCardClick = (studio) => {
        navigate('/studio-preview', { state: { studio } }); // Changed from '/service-preview' to '/studio-preview'
    };

    if (loading) {
        return (
            <div className="studios-page-container">
                <Navbar />
                <StudioHeroSection />
                <h2 className="studios-grid-section-title">Cargando Estudios...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="studios-page-container">
                <Navbar />
                <StudioHeroSection />
                <h2 className="studios-grid-section-title">Error al cargar Estudios</h2>
                <p style={{ textAlign: 'center', color: 'red', fontSize: '1.5rem' }}>{error}</p>
            </div>
        );
    }

    return (
        <div className="studios-page-container">
            <Navbar />
            <StudioHeroSection />

            <h2 className="studios-grid-section-title">Nuestros Estudios de Grabación en España</h2>

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
        </div>
    );
}

export default StudiosPage;