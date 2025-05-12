//src/components/ServicePreview.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function ServicePreview() {
    const navigate = useNavigate();
    const [service, setService] = useState(null);

    useEffect(function () {
        const data = localStorage.getItem('lastService');
        if (!data) {
            navigate('/services');
        } else {
            setService(JSON.parse(data));
        }
    }, []);

    if (!service) return null;

    return (
        <div className="preview-container">
            <img src={service.image} alt="Servicio" className="preview-image" />
            <h2>{service.title}</h2>
            <p>{service.description}</p>
        </div>
    );
}

export default ServicePreview;
