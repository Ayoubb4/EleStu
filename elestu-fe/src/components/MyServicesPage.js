// src/components/MyServicesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/MyServicePage.css';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL;

function MyServicesPage() {
    const navigate = useNavigate();
    const [myServices, setMyServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyServices = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_URL}/services/my-services`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('No se pudieron cargar tus servicios. Inténtalo de nuevo.');
                }
                const data = await response.json();
                setMyServices(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyServices();
    }, [navigate]);

    const handleEdit = (serviceId) => {
        // Navegamos a una ruta de edición que reutilizará el formulario de añadir
        navigate(`/edit-service/${serviceId}`);
    };

    const handleDelete = async (serviceId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este servicio de forma permanente?')) {
            const token = localStorage.getItem('authToken');
            try {
                const response = await fetch(`${API_URL}/services/${serviceId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('No se pudo eliminar el servicio.');

                // Eliminamos el servicio del estado local para actualizar la UI al instante
                setMyServices(prevServices => prevServices.filter(s => s.id !== serviceId));
                alert('Servicio eliminado con éxito.');

            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="my-services-page">
            <Navbar />
            <div className="my-services-header">
                <h1>Gestionar Mis Servicios</h1>
                <p>Aquí puedes ver, editar o eliminar los servicios que has publicado.</p>
            </div>

            <div className="my-services-content">
                {loading && <p>Cargando tus servicios...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && (
                    <div className="my-services-list">
                        {myServices.length > 0 ? (
                            myServices.map(service => (
                                <div className="service-manage-card" key={service.id}>
                                    <img
                                        src={service.image || 'https://placehold.co/150x100/13254e/FFFFFF?text=EleStu'}
                                        alt={service.title}
                                        className="service-manage-image"
                                    />
                                    <div className="service-manage-info">
                                        <h3>{service.title}</h3>
                                        <span>{service.serviceType}</span>
                                        <p>{service.price}€</p>
                                    </div>
                                    <div className="service-manage-actions">
                                        <button onClick={() => handleEdit(service.id)} className="action-btn edit-btn">
                                            <Edit size={18} /> Editar
                                        </button>
                                        <button onClick={() => handleDelete(service.id)} className="action-btn delete-btn">
                                            <Trash2 size={18} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-services-found">
                                <p>Aún no has creado ningún servicio.</p>
                                <button onClick={() => navigate('/add-service')} className="add-service-link">
                                    <PlusCircle size={20} /> Crear mi primer servicio
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyServicesPage;