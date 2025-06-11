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
    const [successMessage, setSuccessMessage] = useState(''); // Nuevo estado para el mensaje de éxito

    // Helper para obtener la fecha de hoy en formato YYYY-MM-DD
    const getMinDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Estado para la hora mínima permitida (se actualizará dinámicamente)
    const [minTime, setMinTime] = useState('');

    // Efecto para cargar datos del estudio y usuario al montar el componente
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

    // Efecto para actualizar la hora mínima (`minTime`) cuando `selectedDate` cambia
    useEffect(() => {
        const today = new Date();
        const currentHour = today.getHours().toString().padStart(2, '0');
        const currentMinute = today.getMinutes().toString().padStart(2, '0');
        const todayFormatted = getMinDate();

        if (selectedDate === todayFormatted) {
            // Si la fecha seleccionada es hoy, la hora mínima es la hora actual
            setMinTime(`${currentHour}:${currentMinute}`);
        } else {
            // Para fechas futuras, no hay restricción de hora (permitir desde 00:00)
            setMinTime('00:00');
        }
        // Opcional: Si la hora seleccionada ya no es válida para la nueva fecha, la borramos.
        // Esto previene que una hora pasada se mantenga si el usuario cambia la fecha a hoy.
        if (selectedTime && selectedDate === todayFormatted) {
            const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);
            const [minHour, minMinute] = minTime.split(':').map(Number);
            if (selectedHour < minHour || (selectedHour === minHour && selectedMinute < minMinute)) {
                setSelectedTime(''); // Borra la hora si es anterior a la mínima permitida
            }
        }
    }, [selectedDate, selectedTime, minTime]); // <-- ¡Aquí está la corrección!

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage(''); // Limpiar mensajes al intentar enviar
        setIsLoading(true);

        if (!selectedDate || !selectedTime) {
            setError('Por favor, completa la fecha y hora de la reserva.');
            setIsLoading(false);
            return;
        }

        // --- Validación frontend adicional para la hora (en caso de que el atributo min sea ignorado por el navegador) ---
        const todayFormatted = getMinDate();
        if (selectedDate === todayFormatted) {
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();

            const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number);

            // Compara la hora seleccionada con la hora actual solo si es la fecha de hoy
            if (selectedHour < currentHour || (selectedHour === currentHour && selectedMinute < currentMinute)) {
                setError('No puedes seleccionar una hora en el pasado para hoy.');
                setIsLoading(false);
                return;
            }
        }
        // --- Fin de la Validación frontend ---

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

            // Manejo de errores específico para el conflicto (hora ya ocupada)
            if (response.status === 409) { // 409 Conflict
                const errorData = await response.json();
                throw new Error(errorData.message || 'La fecha y hora seleccionadas ya no están disponibles.');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar la reserva.');
            }

            setSuccessMessage('¡Reserva enviada con éxito! Revisa tu correo para la confirmación.'); // Establece el mensaje de éxito
            // Puedes añadir una pequeña pausa aquí si quieres que el usuario vea el mensaje
            setTimeout(() => {
                navigate('/reservations'); // Redirige después de un breve momento
            }, 2000); // 2 segundos
        } catch (err) {
            setError(`${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
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
                        <label htmlFor="time">Hora de la Reserva</label>
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
                        <label htmlFor="description">Notas para la reserva (Opcional)</label>
                        <textarea id="description" rows="4" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Grabación de voz, ensayo de banda..." />
                    </div>

                    {/* Mostrar mensaje de éxito o error */}
                    {successMessage && <p className="form-success-message">{successMessage}</p>}
                    {error && <p className="form-error-message">{error}</p>}

                    <button type="submit" className="form-submit-button" disabled={isLoading}>
                        {isLoading ? 'Procesando...' : `Pagar y Confirmar Reserva ${studio?.price}€`}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BookingForm;