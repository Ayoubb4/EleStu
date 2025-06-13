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
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const getMinDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [minTime, setMinTime] = useState('');

    useEffect(() => {
        // --- CORREGIDO: Usamos studio.title que es el dato que pasamos desde la página anterior ---
        if (!studio || !studio.title) {
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
    }, [navigate, studio]);

    useEffect(() => {
        const today = new Date();
        const currentHour = today.getHours().toString().padStart(2, '0');
        const currentMinute = today.getMinutes().toString().padStart(2, '0');
        const todayFormatted = getMinDate();

        if (selectedDate === todayFormatted) {
            setMinTime(`${currentHour}:${currentMinute}`);
        } else {
            setMinTime('00:00');
        }

        if (selectedTime && selectedDate === todayFormatted) {
            const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
            const [minHour, minMinute] = minTime.split(':').map(Number);
            if (selectedHour < minHour || (selectedHour === minHour && selectedMinute < minMinute)) {
                setSelectedTime('');
            }
        }
    }, [selectedDate, selectedTime, minTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (!selectedDate || !selectedTime) {
            setError('Por favor, completa la fecha y hora de la reserva.');
            setIsLoading(false);
            return;
        }

        const todayFormatted = getMinDate();
        if (selectedDate === todayFormatted) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
            if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
                setError('No puedes seleccionar una hora en el pasado para hoy.');
                setIsLoading(false);
                return;
            }
        }

        const authToken = localStorage.getItem('authToken');
        if (!authToken || !currentUser) {
            setError('Sesión no válida. Por favor, inicia sesión de nuevo.');
            setIsLoading(false);
            navigate('/login');
            return;
        }

        // --- MODIFICADO: Eliminamos el precio y corregimos el nombre del estudio ---
        const bookingDetails = {
            studioId: studio.id,
            studioName: studio.title, // Se usa 'title' en lugar de 'name'
            date: selectedDate,
            time: selectedTime,
            description: description || `Solicitud de reserva para ${studio.title}`,
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

            if (response.status === 409) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'La fecha y hora seleccionadas ya no están disponibles.');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar la solicitud.');
            }

            setSuccessMessage('¡Solicitud enviada con éxito! El estudio se pondrá en contacto contigo para confirmar.');
            setTimeout(() => {
                navigate('/reservations');
            }, 3000); // 3 segundos para que el usuario lea el mensaje
        } catch (err) {
            setError(`${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- MANTENEMOS la lógica de carga y error ---
    if (isLoading && !studio) {
        return (
            <div className="page-container"><Navbar /><h2 className="form-main-title">Cargando...</h2></div>
        );
    }
    if (error && !currentUser) {
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

    return (
        <div className="page-container">
            <Navbar />
            <div className="form-wrapper">
                {/* --- MODIFICADO: Título del formulario --- */}
                <h2 className="form-main-title">Solicitar Reserva</h2>

                <form onSubmit={handleSubmit} className="booking-form-new">
                    <div className="form-section-title">Información del Estudio</div>
                    {/* --- CORREGIDO: Usamos studio.title --- */}
                    <p className="studio-booking-info">Estás solicitando una reserva para: {studio?.title}</p>
                    {/* --- MODIFICADO: Eliminada la línea del precio --- */}

                    <div className="form-section-title">Completa los Detalles de la Solicitud</div>
                    <div className="form-group-new">
                        <label htmlFor="userEmail">Tu Email de Contacto</label>
                        <input type="email" id="userEmail" value={currentUser?.email || ''} readOnly />
                    </div>
                    <div className="form-group-new">
                        <label htmlFor="date">Fecha deseada</label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                            min={getMinDate()}
                        />
                    </div>
                    <div className="form-group-new">
                        <label htmlFor="time">Hora de inicio deseada</label>
                        <input
                            type="time"
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                            min={minTime}
                        />
                    </div>
                    <div className="form-group-new">
                        <label htmlFor="description">Notas para el estudio (Opcional)</label>
                        <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Grabación de voz para un podcast, ensayo de banda (4 personas), etc." />
                    </div>

                    {successMessage && <p className="form-success-message">{successMessage}</p>}
                    {error && <p className="form-error-message">{error}</p>}

                    {/* --- MODIFICADO: Texto del botón de envío --- */}
                    <button type="submit" className="form-submit-button" disabled={isLoading}>
                        {isLoading ? 'Enviando...' : `Enviar Solicitud de Reserva`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BookingForm;