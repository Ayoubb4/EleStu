// src/App.js
import React from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from "./components/ForgotPassword";
import Services from "./components/Services";
import AddService from './components/AddService';
import ServiceDetail from './components/ServiceDetail';
import ServicePreview from './components/ServicePreview';
import PaymentMethodPage from './components/PaymentMethodPage';
import StudiosPage from "./components/StudiosPage";
import StudioPreview from "./components/StudioPreview";
import BookingForm from "./components/BookingForm";
import SettingsPage from "./components/SettingsPage";
import ChangeEmailPasswordPage from "./components/ChangeEmailPasswordPage";
import ChangePersonalDataPage from "./components/ChangePersonalDataPage";
import Reservations from './components/Reservations'; // <-- ¡Importa este componente!
import Footer from './components/Footer';

function App() {
    // Usamos el hook useLocation para obtener la ruta actual
    const location = useLocation();

    // Definimos las rutas donde NO queremos que aparezca el footer
    const noFooterPaths = ['/login', '/register', '/forgot-password'];

    // Verificamos si la ruta actual está en la lista de rutas sin footer
    const shouldShowFooter = !noFooterPaths.includes(location.pathname);

    return (
        <div className="App">
            <main>
                <Routes>
                    {/* Rutas de Autenticación */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Rutas Principales */}
                    <Route path="/services" element={<Services />} />
                    <Route path="/studios" element={<StudiosPage />} />

                    {/* Flujo de Reserva de Servicios */}
                    <Route path="/add-service" element={<AddService />} />
                    <Route path="/service/:id" element={<ServiceDetail />} />
                    <Route path="/service-preview" element={<ServicePreview />} />
                    <Route path="/payment-method" element={<PaymentMethodPage />} />

                    {/* Flujo de Reserva de Estudios */}
                    <Route path="/studio-preview" element={<StudioPreview />} />
                    <Route path="/booking-form" element={<BookingForm />} />

                    {/* Rutas de Configuración de Cuenta */}
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/change-email-password" element={<ChangeEmailPasswordPage />} />
                    <Route path="/change-personal-data" element={<ChangePersonalDataPage />} />
                    <Route path="/reservations" element={<Reservations />} /> {/* <-- ¡Añade esta ruta! */}

                    {/* Redirección por defecto */}
                    <Route path="/" element={<Navigate replace to="/login" />} />
                </Routes>
            </main>

            {/* El footer solo se mostrará si shouldShowFooter es true */}
            {shouldShowFooter && <Footer />}
        </div>
    );
}

export default App;