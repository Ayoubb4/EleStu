// src/components/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css';
import Navbar from './Navbar';
import { Calendar, Music, Settings, User } from 'lucide-react';

function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: '', email: '', memberSince: '' });

    useEffect(() => {
        // Simulación de carga de datos del usuario. En una app real, vendría de una API.
        // Por ahora, usamos los datos que tenemos en localStorage.
        const userName = localStorage.getItem('name') || 'Usuario';
        const userEmail = localStorage.getItem('email') || 'email@desconocido.com';

        // Formateamos una fecha de registro de ejemplo
        const joinDate = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
        });

        setUser({
            name: userName,
            email: userEmail,
            memberSince: `Miembro desde ${joinDate}`
        });

        // Si no hay token, redirigir al login
        if (!localStorage.getItem('authToken')) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="profile-page">
            <Navbar />

            <div className="profile-header">
                <div className="profile-avatar">
                    <User size={60} strokeWidth={1.5} />
                </div>
                <h1 className="profile-name">Hola, {user.name}</h1>
                <p className="profile-member-since">{user.memberSince}</p>
            </div>

            <div className="profile-dashboard">

                <div className="dashboard-card" onClick={() => navigate('/reservations')}>
                    <Calendar className="dashboard-card-icon" size={40} />
                    <div className="dashboard-card-text">
                        <h3>Mis Reservas</h3>
                        <p>Consulta y gestiona tus reservas de estudios y servicios.</p>
                    </div>
                </div>

                <div className="dashboard-card" onClick={() => navigate('/my-services')}>
                    <Music className="dashboard-card-icon" size={40} />
                    <div className="dashboard-card-text">
                        <h3>Mis Servicios Ofrecidos</h3>
                        <p>Edita o elimina los servicios que estás ofreciendo.</p>
                    </div>
                </div>

                <div className="dashboard-card" onClick={() => navigate('/settings')}>
                    <Settings className="dashboard-card-icon" size={40} />
                    <div className="dashboard-card-text">
                        <h3>Ajustes de la Cuenta</h3>
                        <p>Modifica tus datos personales, contraseña y más.</p>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default ProfilePage;