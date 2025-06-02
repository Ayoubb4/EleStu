// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css';

function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const [studio, setStudio] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [description, setDescription] = useState('');

    // Estados para almacenar el email y ID del usuario logueado
    const [userEmail, setUserEmail] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);

    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // 1. Obtener datos del estudio desde la navegación
        const { studio } = location.state || {};
        if (!studio) {
            navigate('/studios'); // Redirigir si no hay datos de estudio
        } else {
            setStudio(studio);
        }

        // 2. Lógica de AUTENTICACIÓN: Obtener datos del usuario desde localStorage
        // *** IMPORTANTE: Las claves 'userId' y 'userEmail' deben coincidir EXACTAMENTE
        // con cómo las guardas en authService.js (revisa authService.js más abajo) ***
        const storedUserId = localStorage.getItem('userId'); // Ahora se espera 'userId' (camelCase)
        const storedUserEmail = localStorage.getItem('userEmail'); // Ahora se espera 'userEmail' (camelCase)

        if (storedUserId) {
            // Convertir userId a número, ya que el backend probablemente espera un entero
            setCurrentUserId(parseInt(storedUserId, 10));
        } else {
            // Si userId no se encuentra, significa que el usuario no está logueado o los datos faltan
            setError('User ID not found. Please log in to make a booking.');
            // Opcional: navegar a la página de login
            // navigate('/login');
        }

        if (storedUserEmail) {
            setUserEmail(storedUserEmail);
        } else {
            setError('User email not found. Please log in to make a booking.');
            // Opcional: navegar a la página de login
            // navigate('/login');
        }
        // console.log("User ID from localStorage:", storedUserId);
        // console.log("User Email from localStorage:", storedUserEmail);

    }, [navigate, location.state]); // Dependencias para useEffect

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBookingSuccess(false);

        // Validaciones frontend, incluyendo datos del usuario
        if (!selectedDate || !selectedTime || !description || !userEmail || currentUserId === null) {
            setError('Please fill in all booking details and ensure you are logged in.');
            console.log("Faltan datos para la reserva:", { selectedDate, selectedTime, description, userEmail, currentUserId });
            return;
        }

        // Obtener el token de autenticación de localStorage
        const authToken = localStorage.getItem('authToken'); // Asegúrate de que esta clave coincide con la de authService.js
        if (!authToken) {
            setError('Authentication token not found. Please log in.');
            navigate('/login'); // Redirigir al login si no hay token
            return;
        }

        const bookingDetails = {
            studioId: studio.id,
            studioName: studio.name,
            date: selectedDate,
            time: selectedTime,
            description: description,
            pricePerHour: studio.price,
            userEmail: userEmail,       // Enviamos el email del usuario
            userId: currentUserId,       // Enviamos el ID del usuario
        };

        try {
            const response = await fetch('http://localhost:3000/api/bookings', { // Tu endpoint de backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // **CRUCIAL:** Enviar el token de autenticación en el header Authorization
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(bookingDetails),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Respuesta de error del backend:", errorData);
                throw new Error(errorData.message || 'Error al enviar la reserva.');
            }

            setBookingSuccess(true);
            // Limpiar los campos del formulario después de una reserva exitosa
            setSelectedDate('');
            setSelectedTime('');
            setDescription('');
            // No limpiar userEmail o currentUserId ya que representan al usuario logueado
            console.log("Reserva enviada con éxito.");

        } catch (err) {
            console.error('Error al enviar la reserva:', err);
            setError(`Error al enviar la reserva: ${err.message}`);
        }
    };

    // Muestra un mensaje de carga si el estudio aún no se ha cargado
    if (!studio) {
        return (
            <div className="booking-page-container">
                <Navbar />
                <h2 className="booking-form-title">Cargando formulario de reserva...</h2>
            </div>
        );
    }

    // Muestra un mensaje si el usuario no está logueado o faltan datos esenciales
    if (currentUserId === null || userEmail === '') {
        return (
            <div className="booking-page-container">
                <Navbar />
                <h2 className="booking-form-title">Login Required</h2>
                <p className="booking-error-message">Please log in to make a booking. User ID or Email not found.</p>
                {error && <p className="booking-error-message">{error}</p>}
                {/* Botón para redirigir al usuario a la página de login */}
                <button onClick={() => navigate('/login')} className="submit-booking-button">Go to Login</button>
            </div>
        );
    }

    return (
        <div className="booking-page-container">
            <Navbar />
            <h2 className="booking-form-title">Book Studio: {studio.name}</h2>
            <div className="booking-form-container">
                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                        <label htmlFor="date">Select Date:</label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time">Select Time:</label>
                        <input
                            type="time"
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                        />
                    </div>
                    {/* Mostrar el email del usuario como solo lectura, ya que viene de la autenticación */}
                    <div className="form-group">
                        <label htmlFor="userEmail">Your Email:</label>
                        <input
                            type="email"
                            id="userEmail"
                            value={userEmail}
                            readOnly // El usuario no debería poder cambiar su email aquí
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Brief Description of your needs:</label>
                        <textarea
                            id="description"
                            rows="5"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., 'Mixing and mastering session for an EP', 'Vocal recording for a single', 'Band rehearsal'"
                            required
                        ></textarea>
                    </div>

                    {error && <p className="booking-error-message">{error}</p>}
                    {bookingSuccess && <p className="booking-success-message">Booking submitted successfully! We will contact you soon.</p>}

                    <button type="submit" className="submit-booking-button">Confirm Booking</button>
                </form>
            </div>
        </div>
    );
}

export default BookingForm;