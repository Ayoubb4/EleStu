// src/components/SettingsPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar'; // Importamos el Navbar
import PersonalInfoForm from './PersonalInfoForm'; // Importaremos el nuevo formulario de datos personales
import SecurityForm from './SecurityForm'; // Importaremos el nuevo formulario de seguridad
import { logout } from '../services/authService'; // Importamos la función de logout centralizada
import '../App.css'; // Asegúrate de tener estilos para esta página

function SettingsPage() {
    const navigate = useNavigate();

    // Llama a la función de logout centralizada desde authService
    const handleLogout = () => {
        logout();
        alert('Has cerrado sesión correctamente. Serás redirigido a la página de inicio.');
        navigate('/');
        // Forzar un refresco de la página para asegurar que todo el estado (ej. en el Navbar) se reinicie
        window.location.reload();
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
        <>
            <Navbar /> {/* Navbar añadido al principio de la página */}
            <div className="settings-page-container"> {/* Un contenedor principal para dar estilo y centrar */}
                <h1 className="settings-title">Configuración de la Cuenta</h1>

                {/* --- SECCIÓN PARA DATOS PERSONALES --- */}
                <section className="settings-section">
                    <h2>Datos Personales</h2>
                    <p>Actualiza tu nombre, apellidos y número de teléfono.</p>
                    {/* Aquí irá el componente del formulario para datos personales */}
                    <PersonalInfoForm />
                </section>

                <hr className="settings-divider" /> {/* Separador visual entre secciones */}

                {/* --- SECCIÓN PARA DATOS DE SEGURIDAD --- */}
                <section className="settings-section">
                    <h2>Seguridad de la Cuenta</h2>
                    <p>Cambia tu correo electrónico o contraseña. Se requerirá tu contraseña actual para realizar cualquier cambio.</p>
                    {/* Aquí irá el componente del formulario para seguridad */}
                    <SecurityForm />
                </section>

                <hr className="settings-divider" />

                {/* --- SECCIÓN DE PREGUNTAS FRECUENTES --- */}
                <section className="faq-section">
                    <h2>Preguntas Frecuentes</h2>
                    <div className="faq-scroll-container">
                        {faqs.map((faq, index) => (
                            <div key={index} className="faq-item">
                                <h3>{faq.q}</h3>
                                <p>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <hr className="settings-divider" />

                {/* Botón de Cerrar Sesión */}
                <section className="settings-section">
                    <button className="logout-button" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </section>
            </div>
        </>
    );
}

export default SettingsPage;
