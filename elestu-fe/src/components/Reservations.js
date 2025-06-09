// src/components/Reservations.js
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import '../App.css';
import '../styles/Reservations.css';

const API_URL = process.env.REACT_APP_API_URL;

function Reservations() {
    const [serviceBookings, setServiceBookings] = useState([]);
    const [studioBookings, setStudioBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    const getAuthToken = useCallback(() => {
        return localStorage.getItem('authToken');
    }, []);

    const fetchUserBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        const token = getAuthToken();

        if (!token) {
            setError('No estás autenticado. Por favor, inicia sesión.');
            setLoading(false);
            window.location.href = '/login';
            return;
        }

        try {
            const response = await fetch(`${API_URL}/bookings/my`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error('Autenticación fallida. Redirigiendo a login.');
                    localStorage.removeItem('authToken');
                    window.location.href = '/login';
                    return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar las reservas.');
            }

            const data = await response.json();
            setStudioBookings(data.studioBookings || []);
            setServiceBookings(data.serviceBookings || []);

        } catch (err) {
            console.error('Error fetching bookings:', err);
            setError(err.message || 'No se pudieron cargar tus reservas. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [getAuthToken]);

    useEffect(() => {
        fetchUserBookings();
    }, [fetchUserBookings]);

    const handleCancelRequest = (bookingId, bookingType) => {
        setBookingToCancel({ id: bookingId, type: bookingType });
        setShowConfirmModal(true);
    };

    const confirmCancellation = async () => {
        if (!bookingToCancel) return;

        const { id, type } = bookingToCancel;
        setShowConfirmModal(false);
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        if (!token) {
            setError('No estás autenticado.');
            setLoading(false);
            return;
        }

        try {
            const endpoint = `${API_URL}/bookings/${type}/${id}`;
            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cancelar la reserva.');
            }

            alert('Reserva cancelada con éxito.');
            fetchUserBookings(); // Recargar las reservas para actualizar la UI

        } catch (err) {
            console.error('Error cancelling booking:', err);
            setError(err.message || 'Hubo un error al cancelar la reserva.');
        } finally {
            setLoading(false);
            setBookingToCancel(null);
        }
    };

    const cancelCancellation = () => {
        setShowConfirmModal(false);
        setBookingToCancel(null);
    };

    return (
        <div className="reservations-page">
            <Navbar />
            <div className="reservations-container">
                <h1 className="reservations-title">Mis Reservas</h1>

                {loading && <div className="loading-spinner">Cargando reservas...</div>}
                {error && <div className="error-message">{error}</div>}

                {!loading && !error && (
                    <>
                        {/* Sección de Servicios Contratados */}
                        <section className="reservations-section services-section">
                            <h2 className="section-heading">Servicios Contratados</h2>
                            <div className="bookings-grid">
                                {serviceBookings.length > 0 ? (
                                    serviceBookings.map(booking => (
                                        <div key={booking.id} className="booking-card service-card">
                                            <h3>{booking.serviceTitle || 'Servicio sin título'}</h3>
                                            <p><strong>Fecha:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                                            {booking.time && <p><strong>Hora:</strong> {booking.time}</p>}
                                            <p><strong>Precio:</strong> {Number(booking.price || 0).toFixed(2)}€</p>
                                            <p><strong>Descripción:</strong> {booking.description || 'N/A'}</p>
                                            {/* --- ¡QUITAR ESTA LÍNEA! --- */}
                                            {/* <p><strong>Estado:</strong> <span className={`status-${booking.status?.toLowerCase()}`}>{booking.status}</span></p> */}
                                            {/* --- FIN DE QUITAR --- */}
                                            {/* El botón de cancelar siempre visible si no hay estado */}
                                            <button
                                                className="cancel-button"
                                                onClick={() => handleCancelRequest(booking.id, 'service')}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-bookings-message">No tienes servicios contratados actualmente.</p>
                                )}
                            </div>
                        </section>

                        {/* Sección de Estudios Reservados */}
                        <section className="reservations-section studios-section">
                            <h2 className="section-heading">Estudios Reservados</h2>
                            <div className="bookings-grid">
                                {studioBookings.length > 0 ? (
                                    studioBookings.map(booking => (
                                        <div key={booking.id} className="booking-card studio-card">
                                            <h3>{booking.studioName}</h3>
                                            <p><strong>Fecha:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                                            <p><strong>Hora:</strong> {booking.time}</p>
                                            <p><strong>Descripción:</strong> {booking.description || 'N/A'}</p>
                                            <p><strong>Precio/Hora:</strong> {Number(booking.pricePerHour || 0).toFixed(2)}€</p>
                                            {/* --- ¡QUITAR ESTA LÍNEA! --- */}
                                            {/* <p><strong>Estado:</strong> <span className={`status-${booking.status?.toLowerCase()}`}>{booking.status}</span></p> */}
                                            {/* --- FIN DE QUITAR --- */}
                                            {/* El botón de cancelar siempre visible si no hay estado */}
                                            <button
                                                className="cancel-button"
                                                onClick={() => handleCancelRequest(booking.id, 'studio')}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-bookings-message">No tienes estudios reservados actualmente.</p>
                                )}
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* Modal de Confirmación de Cancelación */}
            {showConfirmModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirmar Cancelación</h2>
                        <p>¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button className="modal-button confirm" onClick={confirmCancellation}>Sí, Cancelar</button>
                            <button className="modal-button cancel" onClick={cancelCancellation}>No, Mantener</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservations;