// src/components/AddService.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';
// import toast from 'react-hot-toast'; // Descomenta si usas react-hot-toast

const API_URL = process.env.REACT_APP_API_URL;

function AddService() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [serviceType, setServiceType] = useState('');

    const serviceTypes = ['Cantante', 'Productor', 'DJ', 'Músico de Sesión', 'Compositor', 'Otro'];
    const serviceTemplates = {
        'Cantante': 'Ofrezco mis servicios como cantante profesional para eventos, grabaciones en estudio y colaboraciones artísticas. Mi especialidad es [Menciona tu estilo principal, ej: Pop, Rock, Soul, Jazz] y cuento con una amplia experiencia en [Describe brevemente tu experiencia, ej: bodas, conciertos en vivo, coros].',
        'Productor': 'Productor musical con experiencia en [Menciona géneros principales, ej: Música Urbana, Electrónica]. Ofrezco servicios completos de producción musical, desde la conceptualización hasta la mezcla y mastering final.',
        'DJ': 'DJ profesional con una trayectoria vibrante, ideal para [Menciona tipos de evento, ej: fiestas privadas, bodas, eventos corporativos]. Mi repertorio musical abarca una amplia gama de géneros.',
        'Músico de Sesión': 'Músico de sesión versátil y profesional, especializado en [Menciona tu instrumento principal, ej: Guitarra, Bajo, Batería, Teclados]. Disponible para grabaciones en estudio y actuaciones en directo.',
        'Compositor': 'Compositor de música original para artistas, bandas, bandas sonoras para videojuegos, publicidad, etc. Mi estilo se caracteriza por [Describe brevemente tu estilo].',
        'Otro': 'Describa aquí detalladamente el servicio que ofrece.'
    };

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
        setDescription(serviceTemplates[type] || '');
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
        const formData = {
            title, description,
            // --- CORREGIDO AQUÍ: Usamos parseInt para asegurar que sea un número entero ---
            price: parseInt(price, 10) || 0,
            image: imagePreview,
            userid: parseInt(userId, 10),
            serviceType: serviceType,
        };
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/services`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                alert('Servicio creado con éxito');
                navigate(`/services`);
            } else {
                const error = await response.json();
                alert(error.message || 'Hubo un error al crear el servicio');
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
                <h2 className="form-main-title">Ofrecer un Nuevo Servicio</h2>

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
                        <input
                            id="price"
                            type="number"
                            placeholder="Ej: 150"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                            // --- CORREGIDO AQUÍ: El step ahora es 1 para no permitir decimales ---
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-group-new">
                        <label htmlFor="image">Imagen del Servicio (Opcional)</label>
                        <input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                    </div>

                    {imagePreview && (
                        <div className="image-preview-container">
                            <img src={imagePreview} alt="Vista previa" className="preview-img" />
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="form-submit-button">
                        {loading ? 'Publicando...' : 'Publicar Servicio'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddService;
