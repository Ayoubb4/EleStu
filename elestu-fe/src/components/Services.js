import React, { useState, useEffect } from 'react';
import '../App.css';
import Navbar from './Navbar';
import studioImg from '../images/studio.jpg'; // Asegúrate de que esta importación sea correcta
import { useNavigate } from 'react-router-dom';

function Services() {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);

    function handleAddServiceClick() {
        navigate('/add-service');
    }

    // AÑADIDO: Función para manejar el clic en una tarjeta de servicio
    function handleServiceClick(service) {
        localStorage.setItem('lastService', JSON.stringify(service)); // Guarda el servicio en localStorage
        navigate('/service-preview'); // Redirige a la vista previa del servicio
    }

    async function fetchServices() {
        try {
            const response = await fetch('http://localhost:3000/api/services');
            const data = await response.json();
            setServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    }

    useEffect(function () {
        fetchServices();
    }, []);

    return (
        <div className="services-page">
            <Navbar />

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
                {services.map(function (service) {
                    return (
                        // MODIFICADO: Añadido el evento onClick a la tarjeta
                        <div className="card" key={service.id} onClick={() => handleServiceClick(service)}>
                            {/* Se utiliza studioImg como imagen por defecto para las tarjetas */}
                            <img src={studioImg} alt="Studio" />
                            <div className="card-info">
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                                <p>{service.price} €</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button className="add-service-btn" onClick={handleAddServiceClick}>
                +
            </button>
        </div>
    );
}

export default Services;