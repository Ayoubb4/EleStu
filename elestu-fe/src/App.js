import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from "./components/ForgotPassword";
import Services from "./components/Services";
import AddService from './components/AddService';
import ServiceDetail from './components/ServiceDetail';
import ServicePreview from './components/ServicePreview';
import PaymentMethodPage from './components/PaymentMethodPage'; // Importa el componente de pago

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/services" element={<Services />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/add-service" element={<AddService />} />
                <Route path="/service/:id" element={<ServiceDetail />} />
                <Route path="/service-preview" element={<ServicePreview />} />
                <Route path="/payment-method" element={<PaymentMethodPage />} />
                <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
        </div>
    );
}

export default App;
