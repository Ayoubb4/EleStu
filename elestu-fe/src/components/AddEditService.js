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
    // El estado 'image' ahora guardará el string Base64
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
                    if (!response.ok) throw new Error('No se pudo encontrar el servicio.');
                    const service = await response.json();
                    setTitle(service.title || '');
                    setDescription(service.description || '');
                    setPrice(service.price?.toString() || '');
                    setServiceType(service.serviceType || '');
                    if (service.image) {
                        setImage(service.image); // Guardamos el Base64 existente
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

    // --- LÓGICA CAMBIADA: Ahora convierte la imagen a Base64 ---
    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setImage(reader.result); // Guardamos el string Base64 en el estado 'image'
                setImagePreview(reader.result);
            };
            reader.onerror = (error) => {
                console.error("Error al leer el archivo:", error);
                alert("Hubo un error al procesar la imagen.");
            };
        }
    }

    const handleServiceTypeChange = (event) => {
        const type = event.target.value;
        setServiceType(type);
        if (!isEditMode && !description) {
            setDescription(serviceTemplates[type] || '');
        }
    };

    // --- LÓGICA CAMBIADA: Ahora envía un JSON normal, no FormData ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userid');
        if (!userId) {
            alert('Usuario no autenticado.');
            return;
        }

        const serviceData = {
            title: title,
            description: description,
            price: parseFloat(price) || 0,
            userid: parseInt(userId, 10),
            serviceType: serviceType,
            image: image, // Enviamos el string Base64 o null
        };

        setLoading(true);

        const url = isEditMode ? `${API_URL}/services/${serviceId}` : `${API_URL}/services`;
        const method = isEditMode ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    // Ahora enviamos JSON
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(serviceData),
            });

            if (response.ok) {
                alert(isEditMode ? 'Servicio actualizado con éxito' : 'Servicio creado con éxito');
                navigate(`/my-services`);
            } else {
                const error = await response.json();
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
        return <div className="page-container"><Navbar /><p>Cargando...</p></div>
    }

    // El resto del return es igual, no necesita cambios
    return (
        <div className="page-container">
            <Navbar />
            <div className="form-wrapper">
                <h2 className="form-main-title">{isEditMode ? 'Editar Servicio' : 'Ofrecer un Nuevo Servicio'}</h2>
                <form onSubmit={handleSubmit} className="booking-form-new">
                    <div className="form-group-new">
                        <label>Tipo de Servicio</label>
                        <select value={serviceType} onChange={handleServiceTypeChange} required>
                            <option value="" disabled>Selecciona un tipo...</option>
                            {serviceTypes.map(type => ( <option key={type} value={type}>{type}</option>))}
                        </select>
                    </div>
                    <div className="form-group-new">
                        <label>Título del Servicio</label>
                        <input type="text" placeholder="Ej: Cantante para bodas y eventos" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group-new">
                        <label>Descripción</label>
                        <textarea placeholder="Describe tu servicio, experiencia, etc." value={description} onChange={(e) => setDescription(e.target.value)} rows="8" required />
                    </div>
                    <div className="form-group-new">
                        <label>Precio (€)</label>
                        <input type="number" placeholder="Ej: 150" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="any" required />
                    </div>
                    <div className="form-group-new">
                        <label>Imagen del Servicio</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </div>
                    {imagePreview && (
                        <div className="image-preview-container">
                            <p>{isEditMode && image ? "Nueva imagen:" : "Imagen:"}</p>
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