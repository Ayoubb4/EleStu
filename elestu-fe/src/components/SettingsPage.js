// src/components/SettingsPage.js
import { useNavigate } from 'react-router-dom'; // Para la redirección
import '../App.css'; // Asegúrate de importar tus estilos globales

// Componente de página de Ajustes
function SettingsPage() {
    const navigate = useNavigate(); // Hook para la navegación
    const handleLogout = () => {
        // Lógica para cerrar sesión
        // TODO: Eliminar token de autenticación (localStorage, cookies, etc.)
        console.log('Cerrar Sesión');
        alert('Sesión cerrada (simulado). Redirigiendo a inicio.');
        navigate('/'); // Redirige al inicio
    };

    // --- Preguntas Frecuentes (FAQs) ---
    const faqs = [
        {
            q: '1. ¿Cuáles son los métodos de pago disponibles en EleStudios?',
            a: 'Aceptamos pagos con tarjeta de crédito/débito, PayPal y otros métodos de pago seguros que iremos ampliando según la demanda de los usuarios.',
        },
        {
            q: '2. ¿Hay comisiones por usar EleStudios?',
            a: 'Sí, EleStudios cobra una pequeña comisión por cada transacción realizada en la plataforma para cubrir costes operativos y garantizar la seguridad de los pagos.',
        },
        {
            q: '3. ¿Puedo obtener un reembolso si el servicio no se ha realizado correctamente?',
            a: 'Si hay algún problema con el servicio, puedes abrir una disputa. Nuestro equipo de soporte revisará el caso y, si es necesario, se realizará un reembolso total o parcial dependiendo de la situación.',
        },
        {
            q: '4. ¿Hay impuestos adicionales en los pagos?',
            a: 'Dependiendo de tu ubicación, pueden aplicarse impuestos adicionales. En la confirmación del pago verás el desglose de los costes, incluyendo cualquier impuesto aplicable.',
        },
        {
            q: '5. ¿Es seguro pagar a través de EleStudios?',
            a: 'Sí, utilizamos pasarelas de pago seguras y cifrado de datos para proteger tu información financiera. Tu seguridad es nuestra máxima prioridad.',
        },
        {
            q: '6. ¿Cómo puedo contactar con soporte técnico?',
            a: 'Puedes contactar con nuestro equipo de soporte técnico a través del formulario de contacto en nuestra web o enviando un email directamente a soporte@elestudios.com. Estamos disponibles 24/7.',
        },
        {
            q: '7. ¿Puedo cancelar una reserva?',
            a: 'Sí, puedes cancelar una reserva desde la sección "Mis Reservas" de tu perfil. Ten en cuenta que las cancelaciones están sujetas a la política de cancelación del estudio o servicio.',
        },
        {
            q: '8. ¿Qué ocurre si el estudio no está disponible a la hora de mi reserva?',
            a: 'En caso de que el estudio no esté disponible por causas ajenas a tu voluntad, te ofreceremos la opción de reprogramar tu reserva o un reembolso completo.',
        },
    ];

    return (
        <div className="settings-page">
            <h1 className="settings-title">Settings</h1> {/* Título principal */}

            {/* Sección de Cambio de Email y Contraseña */}
            <section className="settings-section">
                <h2>Change Email & Password</h2>
                <button
                    className="change-button"
                    onClick={function() {
                        navigate('/change-email-password');
                    }}
                    style={{ marginBottom: '10px' }}
                >
                    Change
                </button>
            </section>

            {/* Sección de Cambio de Datos Personales */}
            <section className="settings-section">
                <h2>Change Email & Password</h2>
                <button
                    className="change-button"
                    onClick={function() {
                        navigate('/change-personal-data');
                    }}
                    style={{ marginBottom: '10px' }}
                >
                    Change
                </button>
            </section>

            {/* Sección de Preguntas Frecuentes con Scroll */}
            <section className="faq-section">
                <h2>Preguntas Frecuentes</h2>
                <div className="faq-scroll-container">
                    {faqs.map(function(faq, index) {
                        return (
                            <div key={index} className="faq-item">
                                <h3>{faq.q}</h3>
                                <p>{faq.a}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Botón de Cerrar Sesión */}
            <button className="logout-button" onClick={handleLogout}>
                Log Out
            </button>
        </div>
    );
}

export default SettingsPage;
