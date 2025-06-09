// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css';

const API_URL = process.env.REACT_APP_API_URL;

function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const { studio } = location.state || {};

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [description, setDescription] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!studio) {
            navigate('/studios');
            return;
        }

        try {
            const userString = localStorage.getItem('user');
            const token = localStorage.getItem('authToken');
            if (userString && token) {
                const userData = JSON.parse(userString);
                if (userData && userData.id && userData.email) {
                    setCurrentUser(userData);
                } else {
                    throw new Error('Datos de usuario en localStorage corruptos.');
                }
            } else {
                throw new Error('No se encontraron datos de sesión.');
            }
        } catch (err) {
            setError('Por favor, inicia sesión para hacer una reserva.');
        } finally {
            setIsLoading(false);
        }
    }, [navigate, location.state, studio]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBookingSuccess(false);
        setIsLoading(true);

        if (!selectedDate || !selectedTime) {
            setError('Por favor, completa la fecha y hora de la reserva.');
            setIsLoading(false);
            return;
        }

        const authToken = localStorage.getItem('authToken');
        if (!authToken || !currentUser) {
            setError('Sesión no válida. Por favor, inicia sesión de nuevo.');
            setIsLoading(false);
            navigate('/login');
            return;
        }

        const bookingDetails = {
            studioId: studio.id,
            studioName: studio.name,
            date: selectedDate,
            time: selectedTime,
            description: description || `Reserva para ${studio.name}`,
            pricePerHour: studio.price,
            userEmail: currentUser.email,
            userId: currentUser.id,
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
            alert('¡Reserva enviada con éxito! Revisa tu correo para la confirmación.');
            navigate('/Reservations');

        } catch (err) {
            setError(`Error al enviar la reserva: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="page-container"><Navbar /><h2 className="form-main-title">Cargando...</h2></div>
        );
    }

    if (error) {
        return (
            <div className="page-container"><Navbar />
                <div className="form-wrapper">
                    <h2 className="form-main-title">Login Requerido</h2>
                    <p className="form-error-message">{error}</p>
                    <button onClick={() => navigate('/login')} className="form-submit-button">Ir al Login</button>
                </div>
            </div>
        );
    }

    // --- JSX ACTUALIZADO CON LAS CLASES CSS CORRECTAS ---
    return (
        <div className="page-container">
            <Navbar />
            <div className="form-wrapper">
                <h2 className="form-main-title">Detalles del Pago y Reserva</h2>

                <form onSubmit={handleSubmit} className="booking-form-new">
                    <div className="form-section-title">Información del Estudio</div>
                    <p className="studio-booking-info">Estás reservando: {studio?.name}</p>
                    <p className="studio-booking-info">Precio: {studio?.price}€ / hora</p>

                    <div className="form-section-title">Completa los Detalles de la Reserva</div>
                    <div className="form-group-new">
                        <label htmlFor="userEmail">Tu Email</label>
                        <input type="email" id="userEmail" value={currentUser?.email || ''} readOnly />
                    </div>
                    <div className="form-group-new">
                        <label htmlFor="date">Fecha de la Reserva</label>
                        <input type="date" id="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
                    </div>
                    <div className="form-group-new">
                        <label htmlFor="time">Hora de la Reserva</label>
                        <input type="time" id="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} required />
                    </div>
                    <div className="form-group-new">
                        <label htmlFor="description">Notas para la reserva (Opcional)</label>
                        <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Grabación de voz, ensayo de banda..." />
                    </div>

                    {bookingSuccess && <p className="form-success-message">¡Reserva enviada con éxito!</p>}
                    {!bookingSuccess && error && <p className="form-error-message">{error}</p>}

                    <button type="submit" className="form-submit-button" disabled={isLoading}>
                        {isLoading ? 'Procesando...' : `Pagar y Confirmar Reserva ${studio?.price}€`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BookingForm;
