import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from "./components/ForgotPassword";
import Services from "./components/Services";
import AddService from './components/AddService';
import ServiceDetail from './components/ServiceDetail'; // Importamos el componente ServiceDetail

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/services" element={<Services />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/add-service" element={<AddService />} />
                <Route path="/service/:id" element={<ServiceDetail />} /> {/* Ruta para el detalle del servicio */}
                <Route path="/" element={<Navigate replace to="/login" />} />
            </Routes>
        </div>
    );
}

export default App;
