import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';
import toast from 'react-hot-toast';

function AddService() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    // Manejo de cambios en la imagen
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');  // Obtener el ID del usuario desde el localStorage
        if (!userId) {
            console.error('Usuario no autenticado');
            toast.error('Usuario no autenticado');
            return;
        }

        const formData = {
            title: title,
            description: description,
            price: parseFloat(price),
            image: imagePreview,
            userid: parseInt(userId),
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
                // Si la creación es exitosa
                const service = await response.json();
                console.log('Servicio creado:', service);
                toast.success('Servicio creado con éxito');
                navigate(`/service/${service.id}`); // Redirige a la página de detalle del servicio creado
            } else {
                const error = await response.json();
                console.error('Error al crear el servicio:', error);
                toast.error('Hubo un error al crear el servicio');
            }
        } catch (error) {
            console.error('Error al intentar guardar el servicio:', error);
            toast.error('Error al guardar el servicio');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="form-container">
                <h2>Crear nuevo servicio</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Título"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Descripción"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    <input
                        type="number"
                        placeholder="Precio"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                    {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="preview-img" />
                    )}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Cargando...' : 'Crear servicio'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddService;
