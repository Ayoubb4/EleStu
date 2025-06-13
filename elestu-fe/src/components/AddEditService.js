// src/components/AddEditService.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL;

function AddEditService() {
    const navigate = useNavigate();
    const { id: serviceId } = useParams();

    const [isEditMode, setIsEditMode] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(true);
    const [serviceType, setServiceType] = useState('');

    const serviceTypes = ['Cantante', 'Productor', 'DJ', 'Músico de Sesión', 'Compositor', 'Otro'];
    const serviceTemplates = {
        'Cantante': 'Ofrezco mis servicios como cantante profesional...',
        'Productor': 'Productor musical con experiencia en...',
        'DJ': 'DJ profesional con una trayectoria vibrante...',
        'Músico de Sesión': 'Músico de sesión versátil y profesional...',
        'Compositor': 'Compositor de música original para artistas...',
        'Otro': 'Describa aquí detalladamente el servicio que ofrece.'
    };

    useEffect(() => {
        if (serviceId) {
            setIsEditMode(true);

            const fetchServiceData = async () => {
                try {
                    const response = await fetch(`${API_URL}/services/${serviceId}`);
                    if (!response.ok) {
                        throw new Error('No se pudo encontrar el servicio para editar.');
                    }
                    const service = await response.json();

                    setTitle(service.title || '');
                    setDescription(service.description || '');
                    setPrice(service.price?.toString() || '');
                    setServiceType(service.serviceType || '');
                    if (service.image) {
                        setImagePreview(service.image);
                    }

                } catch (error) {
                    alert(error.message);
                    navigate('/my-services');
                } finally {
                    setLoading(false);
                }
            };
            fetchServiceData();
        } else {
            setIsEditMode(false);
            setLoading(false);
        }
    }, [serviceId, navigate]);


    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result); };
            reader.readAsDataURL(file);
        }
    }

    const handleServiceTypeChange = (event) => {
        const type = event.target.value;
        setServiceType(type);
        if (!isEditMode && !description) {
            setDescription(serviceTemplates[type] || '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userid');
        if (!userId) {
            alert('Usuario no autenticado.');
            return;
        }
        if (!serviceType) {
            alert('Por favor, selecciona un tipo de servicio.');
            return;
        }

        // --- LÍNEAS AÑADIDAS: Validación y conversión explícita antes de enviar ---
        // 1. Convertimos los valores a número. Usamos parseFloat para admitir decimales en el precio.
        const numericPrice = parseFloat(price);
        const numericUserId = parseInt(userId, 10);

        // 2. Añadimos una validación extra para detener el envío si la conversión falla (por si meten texto o algo raro)
        if (isNaN(numericPrice) || numericPrice < 0) {
            alert("Error: El precio introducido no es un número válido. Por favor, corrígelo.");
            return; // Detenemos el envío
        }
        if (isNaN(numericUserId)) {
            alert("Error: No se ha podido identificar al usuario. Por favor, inicia sesión de nuevo.");
            return; // Detenemos el envío
        }
        // --- FIN DE LAS LÍNEAS AÑADIDAS ---


        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        // --- MODIFICACIÓN SUTIL: Usamos las variables numéricas que acabamos de validar ---
        formData.append('price', numericPrice);
        formData.append('userid', numericUserId);
        formData.append('serviceType', serviceType);

        if (image) {
            formData.append('image', image);
        }

        setLoading(true);

        const url = isEditMode ? `${API_URL}/services/${serviceId}` : `${API_URL}/services`;
        const method = isEditMode ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData,
            });

            if (response.ok) {
                alert(isEditMode ? 'Servicio actualizado con éxito' : 'Servicio creado con éxito');
                navigate(`/my-services`);
            } else {
                const error = await response.json();
                // --- AÑADIDO: Unimos los mensajes de error si vienen en un array ---
                const errorMessage = Array.isArray(error.message) ? error.message.join(', ') : error.message;
                alert(errorMessage || 'Hubo un error al guardar el servicio');
            }
        } catch (error) {
            alert('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <Navbar />
                <p style={{textAlign: 'center', fontSize: '1.5rem', marginTop: '3rem'}}>Cargando...</p>
            </div>
        )
    }

    return (
        <div className="page-container">
            <Navbar />
            <div className="form-wrapper">
                <h2 className="form-main-title">{isEditMode ? 'Editar Servicio' : 'Ofrecer un Nuevo Servicio'}</h2>

                <form onSubmit={handleSubmit} className="booking-form-new">
                    <div className="form-group-new">
                        <label htmlFor="serviceType">Tipo de Servicio</label>
                        <select id="serviceType" value={serviceType} onChange={handleServiceTypeChange} required>
                            <option value="" disabled>Selecciona un tipo...</option>
                            {serviceTypes.map(type => ( <option key={type} value={type}>{type}</option>))}
                        </select>
                    </div>

                    <div className="form-group-new">
                        <label htmlFor="title">Título del Servicio</label>
                        <input id="title" type="text" placeholder="Ej: Cantante para bodas y eventos" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>

                    <div className="form-group-new">
                        <label htmlFor="description">Descripción</label>
                        <textarea id="description" placeholder="Describe tu servicio, experiencia, etc." value={description} onChange={(e) => setDescription(e.target.value)} rows="8" required />
                    </div>

                    <div className="form-group-new">
                        <label htmlFor="price">Precio (€)</label>
                        <input id="price" type="number" placeholder="Ej: 150" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="any" required />
                    </div>

                    <div className="form-group-new">
                        <label htmlFor="image">Imagen del Servicio (Opcional)</label>
                        <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    {imagePreview && (
                        <div className="image-preview-container">
                            <p>{isEditMode && image ? "Nueva imagen:" : (isEditMode ? "Imagen actual:" : "Vista previa:")}</p>
                            <img src={imagePreview} alt="Vista previa" className="preview-img" />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="form-submit-button">
                        {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Publicar Servicio')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddEditService;