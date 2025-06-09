// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL;


function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const [studio, setStudio] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [description, setDescription] = useState('');

    // Estados para almacenar datos del usuario logueado
    const [currentUser, setCurrentUser] = useState(null);

    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Obtener datos del estudio desde la navegación
        const { studio: studioFromState } = location.state || {};
        if (!studioFromState) {
            console.error("No se encontraron datos del estudio. Redirigiendo...");
            navigate('/studios');
            return; // Detener la ejecución si no hay estudio
        }
        setStudio(studioFromState);

        // --- AÑADIDO: Lógica de AUTENTICACIÓN robusta ---
        // Obtenemos los datos del usuario directamente del objeto 'user'
        // que guardamos en localStorage durante el login.
        try {
            const userString = localStorage.getItem('user');
            const token = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userid'); // Verificamos la clave 'userid' en minúsculas

            if (userString && token && userId) {
                const userData = JSON.parse(userString);
                // Verificamos que los datos necesarios (id, email) existan
                if (userData && userData.id && userData.email) {
                    setCurrentUser(userData);
                    console.log('Usuario autenticado encontrado:', userData);
                } else {
                    throw new Error('Datos de usuario en localStorage están corruptos o incompletos.');
                }
            } else {
                // Si falta alguno de los datos clave de la sesión, no está autenticado
                throw new Error('No se encontraron datos de sesión (token o id de usuario).');
            }
        } catch (err) {
            console.error('Error al verificar la autenticación del usuario:', err.message);
            setError('Por favor, inicia sesión para hacer una reserva.');
        }
        // --- FIN DE LA LÓGICA AÑADIDA ---

    }, [navigate, location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBookingSuccess(false);

        if (!selectedDate || !selectedTime || !description) {
            setError('Por favor, completa todos los campos de la reserva.');
            return;
        }

        const authToken = localStorage.getItem('authToken');
        if (!authToken || !currentUser) {
            setError('Sesión no válida o expirada. Por favor, inicia sesión de nuevo.');
            navigate('/login');
            return;
        }

        const bookingDetails = {
            studioId: studio.id,
            studioName: studio.name,
            date: selectedDate,
            time: selectedTime,
            description: description,
            pricePerHour: studio.price,
            userEmail: currentUser.email, // Email del usuario autenticado
            userId: currentUser.id,       // ID del usuario autenticado
        };

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(bookingDetails),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar la reserva.');
            }

            setBookingSuccess(true);
            alert('¡Reserva enviada con éxito!');
            navigate('/studios'); // Redirigir después de la reserva exitosa

        } catch (err) {
            console.error('Error al enviar la reserva:', err);
            setError(`Error al enviar la reserva: ${err.message}`);
        }
    };

    // Muestra el error si no se pudo autenticar al usuario
    if (error) {
        return (
            <div className="login-required-page">
                <Navbar />
                <div className="login-required-content">
                    <h1>Login Requerido</h1>
                    <p>{error}</p>
                    <button onClick={() => navigate('/login')} className="submit-booking-button">Ir al Login</button>
                </div>
            </div>
        );
    }

    // Muestra un mensaje de carga mientras se verifica todo
    if (!studio || !currentUser) {
        return (
            <div className="booking-page-container">
                <Navbar />
                <h2 className="booking-form-title">Cargando...</h2>
            </div>
        );
    }


    return (
        <div className="booking-page-container">
            <Navbar />
            <h2 className="booking-form-title">Reservar Estudio: {studio.name}</h2>
            <div className="booking-form-container">
                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                        <label htmlFor="date">Seleccionar Fecha:</label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time">Seleccionar Hora:</label>
                        <input
                            type="time"
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="userEmail">Tu Email (de la sesión actual):</label>
                        <input
                            type="email"
                            id="userEmail"
                            value={currentUser.email}
                            readOnly // El usuario no debería poder cambiar su email aquí
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Breve descripción de tus necesidades:</label>
                        <textarea
                            id="description"
                            rows="5"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ej: 'Sesión de mezcla y mastering para un EP', 'Grabación de voz para un single', 'Ensayo de banda'"
                            required
                        ></textarea>
                    </div>

                    {bookingSuccess && <p className="booking-success-message">¡Reserva enviada con éxito! Te contactaremos pronto.</p>}

                    <button type="submit" className="submit-booking-button">Confirmar Reserva</button>
                </form>
            </div>
        </div>
    );
}

export default BookingForm;
