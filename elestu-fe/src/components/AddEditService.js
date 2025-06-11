// src/components/AddEditService.js -> Cámbiale el nombre a AddEditService.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';

const API_URL = process.env.REACT_APP_API_URL;

// --- MODIFICADO: El componente ahora es más genérico ---
function AddEditService() {
    const navigate = useNavigate();
    const { id: serviceId } = useParams(); // Obtiene el ID del servicio de la URL si existe
    const location = useLocation(); // Para obtener el estado pasado en la navegación

    // --- MODIFICADO: Estado para determinar si estamos en modo edición ---
    const [isEditMode, setIsEditMode] = useState(false);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
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

    // --- AÑADIDO: useEffect para cargar datos en modo edición ---
    useEffect(() => {
        if (serviceId && location.state?.service) {
            const { service } = location.state;
            setIsEditMode(true);
            setTitle(service.title || '');
            setDescription(service.description || '');
            setPrice(service.price?.toString() || '');
            setServiceType(service.serviceType || '');
            // Nota: La imagen no se puede pre-cargar en un input file por seguridad del navegador.
            // Se puede mostrar la imagen actual, pero no rellenar el input.
            setImagePreview(service.image || null);
        }
    }, [serviceId, location.state]);


    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result); };
            reader.readAsDataURL(file);
        }
    }

    const handleServiceTypeChange = (event) => {
        const type = event.target.value;
        setServiceType(type);
        // --- MODIFICADO: Solo rellenar la plantilla si no estamos en modo edición ---
        if (!isEditMode) {
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

        // --- MODIFICADO: El FormData ahora puede no incluir la imagen si no se cambia ---
        const formData = {
            title,
            description,
            price: parseInt(price, 10) || 0,
            userid: parseInt(userId, 10),
            serviceType: serviceType,
        };
        // Solo añadimos la imagen si se ha subido una nueva, para no sobreescribir la existente con `null`
        if (imagePreview && imagePreview.startsWith('data:image')) {
            formData.image = imagePreview;
        }

        setLoading(true);

        // --- MODIFICADO: La URL y el método cambian si estamos en modo edición ---
        const url = isEditMode ? `${API_URL}/services/${serviceId}` : `${API_URL}/services`;
        const method = isEditMode ? 'PATCH' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                // --- MODIFICADO: Mensaje de éxito dinámico ---
                alert(isEditMode ? 'Servicio actualizado con éxito' : 'Servicio creado con éxito');
                navigate(`/services`);
            } else {
                const error = await response.json();
                alert(error.message || 'Hubo un error al guardar el servicio');
            }
        } catch (error) {
            alert('Error al guardar el servicio.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <Navbar />
            <div className="form-wrapper">
                {/* --- MODIFICADO: Título dinámico --- */}
                <h2 className="form-main-title">{isEditMode ? 'Editar Servicio' : 'Ofrecer un Nuevo Servicio'}</h2>

                <form onSubmit={handleSubmit} className="booking-form-new">
                    <div className="form-group-new">
                        <label htmlFor="serviceType">Tipo de Servicio</label>
                        <select id="serviceType" value={serviceType} onChange={handleServiceTypeChange} required>
                            <option value="" disabled>Selecciona un tipo...</option>
                            {serviceTypes.map(type => ( <option key={type} value={type}>{type}</option> ))}
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
                        <input id="price" type="number" placeholder="Ej: 150" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="1" required />
                    </div>

                    <div className="form-group-new">
                        <label htmlFor="image">Imagen del Servicio (Opcional)</label>
                        <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    {/* --- MODIFICADO: Muestra la imagen existente si no se sube una nueva --- */}
                    {imagePreview && (
                        <div className="image-preview-container">
                            <p>{isEditMode ? "Imagen actual (sube una nueva para reemplazarla):" : "Vista Previa:"}</p>
                            <img src={imagePreview} alt="Vista previa" className="preview-img" />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="form-submit-button">
                        {/* --- MODIFICADO: Texto del botón dinámico --- */}
                        {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Publicar Servicio')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddEditService;