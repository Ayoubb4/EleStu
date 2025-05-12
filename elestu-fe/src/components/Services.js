//src/components/Services.js
import React from 'react';
import '../App.css';
import Navbar from './Navbar';
import studioImg from '../images/studio.jpg';
import { useNavigate } from 'react-router-dom';

const Services = () => {
    const navigate = useNavigate();

    const cards = Array(6).fill({
        name: "Max Payton",
        description: "Producción musical completa, Mezcla y masterización. 11€/h"
    });

    const handleAddServiceClick = () => {
        // Redirige a la página de creación de servicio
        navigate('/add-service');
    };

    return (
        <div className="services-page">
            <Navbar /> {/* Usa el componente Navbar */}

            <div className="hero-section">
                <div className="hero-overlay">
                    <h2>What are u searching?</h2>
                    <p>
                        The Services section of EleStu allows users to hire musicians, producers, and sound engineers,
                        as well as rent recording studios through an Airbnb-style API. Additionally, users can find and offer
                        music-related services via a system similar to Fiverr. The platform ensures an intuitive, visually
                        appealing, and accessible experience for all.
                    </p>
                </div>
            </div>

            <div className="card-grid">
                {cards.map((card, index) => (
                    <div className="card" key={index}>
                        <img src={studioImg} alt="Studio" />
                        <div className="card-info">
                            <h3>{card.name}</h3>
                            <p>{card.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón flotante de añadir servicio */}
            <button className="add-service-btn" onClick={handleAddServiceClick}>
                +
            </button>
        </div>
    );
};

export default Services;
