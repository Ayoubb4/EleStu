import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import Navbar from './Navbar';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Tu clave pública de Stripe (¡asegúrate de que sea la de prueba!)
const stripePromise = loadStripe('pk_test_51RRYlABLLQhi6zmnhz8XOG6GmVPXGFroC6nQmhDWhP0Jf4gkuQP1Xd4k5Zeici1faTW3q5sJpWDCSOZGhEjzQhdz000E6PdJW4');

// Componente interno que usa los hooks de Stripe
function CheckoutForm({ orderSummary, onPaymentSuccess, onPaymentError, userId, selectedPaymentMethod }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleProcessPayment = async (event) => {
        event.preventDefault(); // Evita el envío por defecto del formulario

        if (!stripe || !elements) {
            // Stripe.js aún no se ha cargado.
            // Asegúrate de que Stripe.js se haya cargado antes de intentar usarlo.
            return;
        }

        setLoading(true);
        setMessage('');

        console.log("Selected Payment Method in CheckoutForm:", selectedPaymentMethod);

        // 1. Crear un PaymentIntent en tu backend
        // CAMBIADO: Añadido '/api' al path para que coincida con el prefijo global del backend
        try {
            const response = await fetch('http://localhost:3000/api/payments/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: orderSummary ? orderSummary.price * 100 : 0, // Stripe usa centavos
                    currency: 'eur',
                    serviceId: orderSummary ? orderSummary.id : null,
                    serviceTitle: orderSummary ? orderSummary.title : 'Unknown Service',
                    userId: userId,
                    selectedPaymentMethod: selectedPaymentMethod,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setMessage(`Error del servidor: ${data.error}`);
                setLoading(false);
                onPaymentError(data.error);
                return;
            }

            const clientSecret = data.clientSecret;

            // 2. Confirmar el pago en el frontend con Stripe Elements
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: cardDetails.nameOnCard, // Usar el nombre del formulario
                        address: {
                            country: cardDetails.country, // Usar el país del formulario
                        },
                    },
                },
            });

            if (error) {
                setMessage(`Payment failed: ${error.message}`);
                onPaymentError(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                setMessage('Payment succeeded!');
                onPaymentSuccess(); // Llama a la función para avanzar al paso 3
            }
        } catch (apiError) {
            setMessage(`Network error: ${apiError.message}`);
            onPaymentError(apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const [cardDetails, setCardDetails] = useState({
        nameOnCard: '',
        country: ''
    });

    const handleCardDetailsChange = (e) => {
        const { name, value } = e.target;
        setCardDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const CARD_ELEMENT_OPTIONS = {
        style: {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    };

    return (
        <form onSubmit={handleProcessPayment} className="card-info-section">
            <h3>Card information</h3>
            <div className="input-group">
                <CardElement options={CARD_ELEMENT_OPTIONS} className="payment-input stripe-card-element" />
                <span className="flag-icon">🇪🇸</span>
            </div>

            <h3>Name on card</h3>
            <div className="input-group">
                <input
                    type="text"
                    name="nameOnCard"
                    placeholder="Name"
                    value={cardDetails.nameOnCard}
                    onChange={handleCardDetailsChange}
                    className="payment-input"
                    required
                />
            </div>

            <h3>Country or region</h3>
            <div className="input-group">
                <select
                    name="country"
                    value={cardDetails.country}
                    onChange={handleCardDetailsChange}
                    className="payment-input"
                    required
                >
                    <option value="">Country</option>
                    <option value="ES">España</option>
                    <option value="US">United States</option>
                    <option value="UK">United Kingdom</option>
                </select>
            </div>

            <button className="pay-button" type="submit" disabled={!stripe || loading}>
                {loading ? 'Processing...' : `Pay €${orderSummary ? orderSummary.price : '0.00'}`}
            </button>
            {message && <div className="payment-message">{message}</div>}
        </form>
    );
}

// Componente principal de la página de métodos de pago
function PaymentMethodPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [orderSummary, setOrderSummary] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userid');
        if (storedUserId) {
            setUserId(storedUserId);
        } else {
            console.warn("User ID not found in localStorage. Payment might not be linked to a user.");
        }

        const serviceData = localStorage.getItem('currentServiceForPayment');
        if (serviceData) {
            setOrderSummary(JSON.parse(serviceData));
        } else {
            console.warn("No service found for payment. Redirecting to services.");
        }
    }, [navigate]);

    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
        setCurrentStep(2);
    };

    const handlePaymentSuccess = () => {
        setCurrentStep(3);
        console.log("Pago exitoso. Revisar el correo de confirmación.");
    };

    const handlePaymentError = (errorMessage) => {
        console.error("Error en el pago:", errorMessage);
    };

    const renderStepCircles = () => (
        <div className="payment-steps">
            <span className={`step-circle ${currentStep === 1 ? 'active' : ''}`}>1</span>
            <span className={`step-circle ${currentStep === 2 ? 'active' : ''}`}>2</span>
            <span className={`step-circle ${currentStep === 3 ? 'active' : ''}`}>3</span>
        </div>
    );

    const renderContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <h2 className="payment-method-title">Payment Method</h2>
                        {renderStepCircles()}
                        <div className="payment-options-grid">
                            <div className="payment-option-column">
                                <div className="payment-option-item" onClick={() => handlePaymentMethodSelect('visa_mastercard')}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa Logo" className="payment-logo" />
                                    <p>VISA</p>
                                </div>
                                <div className="payment-option-item" onClick={() => handlePaymentMethodSelect('paypal')}>
                                    <img src="https://www.paypalobjects.com/paypal-ui/logos/logo_paypal_2x.png" alt="PayPal Logo" className="payment-logo" />
                                    <p>PayPal</p>
                                </div>
                                <div className="payment-option-item" onClick={() => handlePaymentMethodSelect('apple_pay')}>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Apple_Pay_logo.svg/1200px-Apple_Pay_logo.svg.png" alt="Apple Pay Logo" className="payment-logo" />
                                    <p>Apple Pay</p>
                                </div>
                            </div>

                            <div className="payment-option-column">
                                <div className="payment-option-item" onClick={() => handlePaymentMethodSelect('visa_mastercard')}>
                                    <p>VISA or MASTERCARD</p>
                                </div>
                                <div className="payment-option-item" onClick={() => handlePaymentMethodSelect('paypal')}>
                                    <p>PAYPAL</p>
                                </div>
                                <div className="payment-option-item" onClick={() => handlePaymentMethodSelect('apple_pay')}>
                                    <p>Apple Pay</p>
                                </div>
                            </div>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        <h2 className="payment-method-title">Payment Method</h2>
                        {renderStepCircles()}
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                orderSummary={orderSummary}
                                onPaymentSuccess={handlePaymentSuccess}
                                onPaymentError={handlePaymentError}
                                userId={userId}
                                selectedPaymentMethod={selectedPaymentMethod}
                            />
                        </Elements>
                    </>
                );
            case 3:
                return (
                    <>
                        <h2 className="payment-method-title">Payment Method</h2>
                        {renderStepCircles()}
                        <div className="confirmation-section">
                            <div className="check-mail-box">
                                <img src="https://cdn-icons-png.flaticon.com/512/104/104023.png" alt="Mail Icon" className="mail-icon" />
                                <p>Check Ur Mail Inbox 4 More Info</p>
                            </div>

                            <h3 className="order-summary-title">Resumen del Pedido Contratado</h3>
                            {orderSummary ? (
                                <div className="order-summary-box">
                                    <h4>{orderSummary.title}</h4>
                                    <p>Duración: {orderSummary.duration || 'N/A'}</p>
                                    <p>Incluye: {orderSummary.description}</p>
                                    <p className="expected-result">
                                        ✔ Resultado esperado: Tema listo para lanzamiento con calidad profesional en todas las etapas del proceso.
                                    </p>
                                </div>
                            ) : (
                                <p>No hay resumen de pedido disponible.</p>
                            )}

                            <button className="pay-button" onClick={() => navigate('/services')}>
                                Back to Services
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
