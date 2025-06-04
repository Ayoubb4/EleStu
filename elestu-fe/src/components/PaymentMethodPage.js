// src/components/PaymentMethodPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RRYlABLLQhi6zmnhz8XOG6GmVPXGFroC6nQmhDWhP0Jf4gkuQP1Xd4k5Zeici1faTW3q5sJpWDCSOZGhEjzQhdz000E6PdJW4');

function CheckoutForm({ orderSummary, onPaymentSuccess, onPaymentError, userId }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Estado para todos los detalles, incluyendo los de la reserva
    const [formDetails, setFormDetails] = useState({
        nameOnCard: '',
        country: '',
        bookingDate: '', // Nuevo estado para la fecha de reserva
        bookingTime: '', // Nuevo estado para la hora de reserva
        bookingDescription: orderSummary?.description || '', // Nuevo estado para la descripción, pre-llenado si es posible
    });

    // Efecto para pre-rellenar bookingDescription si orderSummary cambia y aún no ha sido modificado por el usuario
    useEffect(() => {
        if (orderSummary?.description && formDetails.bookingDescription === '') {
            setFormDetails(prevDetails => ({
                ...prevDetails,
                bookingDescription: orderSummary.description,
            }));
        }
    }, [orderSummary, formDetails.bookingDescription]);


    const handleFormDetailsChange = (e) => {
        const { name, value } = e.target;
        setFormDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleProcessPayment = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }
        if (!orderSummary) {
            setMessage('Error: No hay resumen del pedido (orderSummary).');
            onPaymentError('No hay resumen del pedido (orderSummary).');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Validar que los campos de fecha y hora no estén vacíos si son requeridos
            if (!formDetails.bookingDate || !formDetails.bookingTime) {
                setMessage('Por favor, completa la fecha y hora de la reserva.');
                setLoading(false);
                onPaymentError('Fecha y hora de reserva requeridas.');
                return;
            }


            const response = await fetch('http://localhost:3000/api/payments/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: orderSummary.price * 100, // Asegúrate que orderSummary y orderSummary.price existen
                    currency: 'eur',
                    serviceId: orderSummary.id, // Asegúrate que orderSummary.id existe
                    serviceTitle: orderSummary.title || 'Unknown Service',
                    userId: userId,
                    // --- Campos añadidos ---
                    bookingDate: formDetails.bookingDate,
                    bookingTime: formDetails.bookingTime,
                    bookingDescription: formDetails.bookingDescription || orderSummary.description || 'Reserva de servicio', // Fallback
                }),
            });

            const data = await response.json();

            if (!response.ok || data.error) { // Comprobar si la respuesta no fue OK o si hay un error en el JSON
                const errorMessage = data.error || `Error del servidor: ${response.statusText} (Status: ${response.status})`;
                setMessage(errorMessage);
                setLoading(false);
                onPaymentError(errorMessage);
                return;
            }

            const clientSecret = data.clientSecret;
            if (!clientSecret) {
                setMessage('Error: No se recibió el clientSecret del servidor.');
                setLoading(false);
                onPaymentError('No se recibió el clientSecret.');
                return;
            }


            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: formDetails.nameOnCard,
                        address: {
                            // Stripe puede requerir más detalles de dirección para algunas tarjetas/regiones
                            // Por ahora solo país, ajusta según necesites.
                            country: formDetails.country, // Código de país de 2 letras (ej. 'ES', 'US')
                        },
                    },
                },
            });

            if (error) {
                setMessage(`Error en el pago: ${error.message}`);
                onPaymentError(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                setMessage('¡Pago exitoso!');
                onPaymentSuccess();
            }
        } catch (apiError) {
            setMessage(`Error de red o al procesar el pago: ${apiError.message}`);
            onPaymentError(apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const CARD_ELEMENT_OPTIONS = {
        style: {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': { color: '#aab7c4' },
            },
            invalid: { color: '#fa755a', iconColor: '#fa755a' },
        },
    };

    if (!orderSummary) { // Añade una comprobación por si orderSummary es null
        return <p>Cargando resumen del pedido o pedido no encontrado...</p>;
    }

    return (
        <form onSubmit={handleProcessPayment} className="card-info-section">
            <h3>Información de la Tarjeta</h3>
            <div className="input-group">
                <CardElement options={CARD_ELEMENT_OPTIONS} className="payment-input stripe-card-element" />
            </div>

            <h3>Nombre en la Tarjeta</h3>
            <div className="input-group">
                <input
                    type="text"
                    name="nameOnCard"
                    placeholder="Nombre tal como aparece en la tarjeta"
                    value={formDetails.nameOnCard}
                    onChange={handleFormDetailsChange}
                    className="payment-input"
                    required
                />
            </div>

            <h3>País o Región</h3>
            <div className="input-group">
                <select
                    name="country"
                    value={formDetails.country}
                    onChange={handleFormDetailsChange}
                    className="payment-input"
                    required
                >
                    <option value="">Selecciona País</option>
                    <option value="ES">España</option>
                    <option value="US">Estados Unidos</option>
                    <option value="GB">Reino Unido</option>
                    {/* Añade más países según necesites */}
                </select>
            </div>

            {/* --- NUEVOS CAMPOS PARA LA RESERVA --- */}
            <h3>Fecha de la Reserva</h3>
            <div className="input-group">
                <input
                    type="date"
                    name="bookingDate"
                    value={formDetails.bookingDate}
                    onChange={handleFormDetailsChange}
                    className="payment-input"
                    required
                />
            </div>

            <h3>Hora de la Reserva</h3>
            <div className="input-group">
                <input
                    type="time"
                    name="bookingTime"
                    value={formDetails.bookingTime}
                    onChange={handleFormDetailsChange}
                    className="payment-input"
                    required
                />
            </div>

            <h3>Notas para la Reserva (Descripción)</h3>
            <div className="input-group">
                <textarea
                    name="bookingDescription"
                    placeholder="Instrucciones especiales o descripción para tu reserva..."
                    value={formDetails.bookingDescription}
                    onChange={handleFormDetailsChange}
                    className="payment-input"
                    rows="3"
                    required // El backend lo espera, así que es mejor que sea required
                />
            </div>
            {/* --- FIN DE NUEVOS CAMPOS --- */}


            <button className="pay-button" type="submit" disabled={!stripe || loading || !orderSummary}>
                {loading ? 'Procesando...' : `Pagar €${orderSummary.price ? orderSummary.price.toFixed(2) : '0.00'}`}
            </button>
            {message && <div className={`payment-message ${message.startsWith('¡Pago exitoso!') ? 'success' : 'error'}`}>{message}</div>}
        </form>
    );
}

function PaymentMethodPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1); // Sigue siendo 1 para el método, 2 para detalles/pago
    // selectedPaymentMethod ya no es necesario pasarlo a CheckoutForm si no se usa en la API de create-payment-intent
    // const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [orderSummary, setOrderSummary] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userid');
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            console.warn("User ID not found in localStorage. Payment might not be linked to a registered user.");
        }

        const serviceData = localStorage.getItem('currentServiceForPayment');
        if (serviceData) {
            try {
                const parsedData = JSON.parse(serviceData);
                setOrderSummary(parsedData);
                // Pre-seleccionar el paso 2 si ya tenemos la información del servicio
                // y asumimos que el método de pago es tarjeta por defecto.
                setCurrentStep(2); // Ir directamente al formulario de pago si hay orderSummary
            } catch (e) {
                console.error("Error parsing service data from localStorage:", e);
                navigate('/services'); // O a una página de error
            }
        } else {
            console.warn("No service found for payment. Redirecting to services.");
            // navigate('/services'); // Podrías redirigir si no hay orderSummary
        }
    }, [navigate]);

    // Ya no necesitamos handlePaymentMethodSelect si vamos directo al paso 2
    /*
    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
        setCurrentStep(2);
    };
    */

    const handlePaymentSuccess = () => {
        setCurrentStep(3); // Avanzar al paso de confirmación
        // Limpiar localStorage para evitar reusar datos viejos
        localStorage.removeItem('currentServiceForPayment');
        console.log("Pago exitoso. Revisar el correo de confirmación.");
    };

    const handlePaymentError = (errorMessage) => {
        console.error("Error en el pago:", errorMessage);
        // Aquí podrías mostrar un mensaje de error más visible al usuario si es necesario
    };

    const renderStepCircles = () => (
        <div className="payment-steps">
            <span className={`step-circle ${currentStep >= 1 ? 'active' : ''}`}>1</span>
            <span className={`step-circle ${currentStep >= 2 ? 'active' : ''}`}>2</span>
            <span className={`step-circle ${currentStep >= 3 ? 'active' : ''}`}>3</span>
        </div>
    );

    const renderContent = () => {
        // Simplificado para ir directamente al paso 2 (formulario de pago) si hay orderSummary
        // El paso 1 de selección de método de pago se omite por ahora, asumiendo tarjeta.
        // Si necesitas múltiples métodos de pago, deberías reactivar el paso 1.
        if (!orderSummary && currentStep !== 3) { // Si no hay orderSummary y no estamos en la confirmación
            return (
                <>
                    <h2 className="payment-method-title">Procesando Pedido...</h2>
                    {renderStepCircles()}
                    <p>Cargando información del servicio. Si no se carga, por favor, vuelve a la <a href="/services">lista de servicios</a>.</p>
                </>
            );
        }


        switch (currentStep) {
            case 1: // Este caso ya no se usaría si vamos directo al 2
                return (
                    <>
                        <h2 className="payment-method-title">Seleccionar Método de Pago</h2>
                        {renderStepCircles()}
                        <p>Este paso se ha omitido y se asume pago con tarjeta.</p>
                        <button onClick={() => setCurrentStep(2)}>Continuar a Detalles de Pago</button>
                        {/* ... tu UI original para seleccionar método de pago ... */}
                    </>
                );
            case 2: // Formulario de detalles de tarjeta y reserva
                return (
                    <>
                        <h2 className="payment-method-title">Detalles del Pago y Reserva</h2>
                        {renderStepCircles()}
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                orderSummary={orderSummary}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentError={handlePaymentError}
                                userId={userId}
                                // selectedPaymentMethod ya no se pasa
                            />
                        </Elements>
                    </>
                );
            case 3: // Confirmación de pago
                return (
                    <>
                        <h2 className="payment-method-title">Pago Completado</h2>
                        {renderStepCircles()}
                        <div className="confirmation-section">
                            <div className="check-mail-box">
                                <img src="https://cdn-icons-png.flaticon.com/512/104/104023.png" alt="Mail Icon" className="mail-icon" />
                                <p>¡Pago realizado con éxito! Revisa tu bandeja de entrada para más información.</p>
                            </div>

                            <h3 className="order-summary-title">Resumen del Pedido Contratado</h3>
                            {orderSummary ? ( // orderSummary podría ser null aquí si se limpió antes de tiempo.
                                // Sería mejor pasar los datos del pedido a este paso o recargarlos.
                                // Por ahora, asumimos que orderSummary (del estado, antes de limpiar localStorage) todavía está disponible
                                <div className="order-summary-box">
                                    <h4>{orderSummary.title}</h4>
                                    {/* Muestra los detalles de la reserva si los tienes */}
                                    {/* <p>Fecha: {formDetails.bookingDate}</p> */} {/* Necesitarías pasar estos datos */}
                                    {/* <p>Hora: {formDetails.bookingTime}</p> */}
                                    <p>Descripción: {orderSummary.description}</p>
                                    <p className="expected-result">
                                        ✔ Revisa tu correo para los detalles completos de la reserva y del servicio.
                                    </p>
                                </div>
                            ) : (
                                <p>No hay resumen de pedido disponible. Revisa tu correo electrónico.</p>
                            )}

                            <button className="pay-button" onClick={() => navigate('/services')}>
                                Volver a Servicios
                            </button>
                        </div>
                    </>
                );
            default:
                return <p>Error: Paso desconocido.</p>;
        }
    };

    return (
        <div className="payment-method-page">
            <Navbar />
            <div className="payment-content-wrapper">
                {renderContent()}
            </div>
        </div>
    );
}

export default PaymentMethodPage;