import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL;


function ServiceDetail() {
    const { id } = useParams();
    const [service, setService] = useState(null);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const response = await fetch(`${API_URL}/services/${id}`);
                const data = await response.json();
                setService(data);
            } catch (error) {
                console.error('Error fetching service:', error);
            }
        };

        fetchService();
    }, [id]);

    if (!service) return <div>Loading...</div>;

    return (
        <div className="service-detail-container">
            <div className="service-detail">
                <img src={service.image} alt="Service" className="service-detail-image" />
                <div className="service-detail-info">
                    <h2>{service.title}</h2>
                    <p>{service.description}</p>
                    <div className="service-price">
                        <span>{service.price} €</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServiceDetail;
