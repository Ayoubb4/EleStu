//src/components/ServiceList.js
import React, { useState, useEffect } from 'react';

function ServicesList() {
    const [services, setServices] = useState([]);

    const fetchServices = async () => {
        const response = await fetch('http://localhost:3000/api/services');
        const data = await response.json();
        setServices(data);
    };

    useEffect(() => {
        fetchServices();
    }, []);

    return (
        <div>
            <h2>Servicios</h2>
            <ul>
                {services.map((service) => (
                    <li key={service.id}>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        <p>${service.price}</p>
                        {service.image && (
                            <img
                                src={service.image}
                                alt="Vista previa del servicio"
                                style={{ width: '200px', height: 'auto' }}
                            />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ServicesList;
