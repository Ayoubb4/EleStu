//src/components/AddService.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Your existing CSS file
import Navbar from './Navbar';
import toast from 'react-hot-toast';

function AddService() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [serviceType, setServiceType] = useState(''); // ADDED: State for service type

    // ADDED: Service types and their corresponding templates
    const serviceTypes = ['Cantante', 'Productor', 'DJ', 'Músico de Sesión', 'Compositor', 'Otro'];
    const serviceTemplates = {
        'Cantante': 'Ofrezco mis servicios como cantante profesional para eventos, grabaciones en estudio y colaboraciones artísticas. Mi especialidad es [Menciona tu estilo principal, ej: Pop, Rock, Soul, Jazz] y cuento con una amplia experiencia en [Describe brevemente tu experiencia, ej: bodas, conciertos en vivo, coros]. Puedo adaptarme a diversos géneros y estoy abierto/a a nuevos proyectos musicales. ¡Contáctame para darle voz a tu música!',
        'Productor': 'Productor musical con experiencia en [Menciona géneros principales, ej: Música Urbana, Electrónica, Indie Pop]. Ofrezco servicios completos de producción musical, desde la conceptualización y composición de la idea inicial, arreglos, grabación, hasta la mezcla y mastering final. Trabajo con [Menciona DAWs o equipo relevante, ej: Ableton Live, Logic Pro X, Pro Tools] para asegurar un sonido profesional y pulido para tus canciones. ¡Transformemos tus ideas musicales en producciones impactantes!',
        'DJ': 'DJ profesional con una trayectoria vibrante, ideal para [Menciona tipos de evento, ej: fiestas privadas, bodas, eventos corporativos, discotecas]. Mi repertorio musical abarca una amplia gama de géneros, incluyendo [Menciona géneros principales, ej: House, Techno, Reggaeton, Funk, Éxitos actuales y clásicos]. Me adapto al ambiente que desees crear, garantizando una sesión llena de energía. Cuento con equipo propio de alta calidad. ¡Hagamos de tu evento una experiencia musical inolvidable!',
        'Músico de Sesión': 'Músico de sesión versátil y profesional, especializado en [Menciona tu instrumento principal, ej: Guitarra Eléctrica/Acústica, Bajo Eléctrico, Batería, Teclados/Piano]. Disponible para grabaciones en estudio, actuaciones en directo y giras. Domino una variedad de géneros como [Menciona géneros en los que tienes experiencia, ej: Rock, Pop, Funk, Blues, Jazz, Metal]. Aporto creatividad, técnica y un sonido adaptado a las necesidades de tu proyecto. ¡Listo/a para sumar mi talento a tu música!',
        'Compositor': 'Compositor de música original para diversos fines: [Menciona para qué compones, ej: artistas solistas, bandas, bandas sonoras para videojuegos, publicidad, cortometrajes, obras de teatro]. Mi estilo compositivo se caracteriza por [Describe brevemente tu estilo o enfoque, ej: melodías emotivas y memorables, ritmos energéticos y modernos, atmósferas cinematográficas y evocadoras]. Puedo crear piezas instrumentales o canciones completas (letra y música) que transmitan la emoción y el mensaje que buscas. ¡Pongámosle la banda sonora perfecta a tus ideas!',
        'Otro': 'Describa aquí detalladamente el servicio que ofrece, incluyendo su especialidad, experiencia relevante y cualquier otro detalle que considere importante para los potenciales clientes.'
    };

    // Manejo de cambios en la imagen (existing function - no changes needed here)
    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = function () {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    // ADDED: Handler for service type change to update description template
    const handleServiceTypeChange = (event) => {
        const type = event.target.value;
        setServiceType(type);
        if (serviceTemplates[type]) {
            setDescription(serviceTemplates[type]); // Pre-fill description
        } else {
            setDescription(''); // Clear description if no template (e.g., for "Selecciona un tipo...")
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userid');
        if (!userId) {
            console.error('Usuario no autenticado');
            toast.error('Usuario no autenticado');
            return;
        }

        if (!serviceType) { // ADDED: Basic validation for service type
            toast.error('Por favor, selecciona un tipo de servicio.');
            return;
        }

        const formData = {
            title: title,
            description: description,
            price: parseFloat(price) || 0, // Ensure price is a number, default to 0 if empty
            image: imagePreview, // Ensure your backend can handle base64 image strings or modify to send as FormData
            userid: parseInt(userId),
            serviceType: serviceType, // ADDED: Include serviceType in the form data
        };

        setLoading(true);

        try {
            const response = await fetch('http://localhost:3000/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const service = await response.json();
                console.log('Servicio creado:', service);
                toast.success('Servicio creado con éxito');
                navigate(`/services`); // Consider navigating to the new service detail page: navigate(`/service/${service.id}`);
            } else {
                const error = await response.json();
                console.error('Error al crear el servicio:', error.message || error);
                toast.error(error.message || 'Hubo un error al crear el servicio');
            }
        } catch (error) {
            console.error('Error al intentar guardar el servicio:', error);
            toast.error('Error al guardar el servicio. Revisa la consola para más detalles.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            {/* MODIFIED: Added a specific class for styling this form */}
            <div className="form-container add-service-container">
                <h2>Crear nuevo servicio</h2>
                <form onSubmit={handleSubmit}>
                    {/* ADDED: Service Type Select */}
                    <div className="form-group">
                        <label htmlFor="serviceType">Tipo de Servicio</label>
                        <select
                            id="serviceType"
                            value={serviceType}
                            onChange={handleServiceTypeChange}
                            required
                        >
                            <option value="" disabled>Selecciona un tipo...</option>
                            {serviceTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* MODIFIED: Added form-group and label */}
                    <div className="form-group">
                        <label htmlFor="title">Título del Servicio</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="Ej: Cantante para bodas y eventos"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* MODIFIED: Added form-group and label */}
                    <div className="form-group">
                        <label htmlFor="description">Descripción del Servicio</label>
                        <textarea
                            id="description"
                            placeholder="Describe tu servicio, experiencia, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="8" // Increased rows for better template visibility
                            required
                        />
                    </div>

                    {/* MODIFIED: Added form-group and label */}
                    <div className="form-group">
                        <label htmlFor="image">Imagen del Servicio</label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </div>

                    {imagePreview && (
                        <div className="image-preview-container"> {/* ADDED: Wrapper for better styling control */}
                            <img src={imagePreview} alt="Preview" className="preview-img" />
                        </div>
                    )}

                    {/* MODIFIED: Added form-group and label */}
                    <div className="form-group">
                        <label htmlFor="price">Precio (€) (opcional)</label>
                        <input
                            id="price"
                            type="number"
                            placeholder="Ej: 150 (solo el número)"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                            step="0.01" // Allows for cents if needed
                        />
                    </div>

                    {/* MODIFIED: Added a class for styling */}
                    <button type="submit" disabled={loading} className="submit-button styled-button">
                        {loading ? 'Creando servicio...' : 'Crear servicio'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddService;