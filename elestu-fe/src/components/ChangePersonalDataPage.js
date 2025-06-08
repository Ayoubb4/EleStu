// src/components/ChangePersonalDataPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import PersonalInfoForm from './PersonalInfoForm'; // Reutilizamos el formulario que ya hicimos
import '../App.css';

function ChangePersonalDataPage() {
    const navigate = useNavigate();

    return (
        <div className="settings-subpage">
            <Navbar />
            <h1 className="settings-title-main">Change Personal Data</h1>

            <div className="form-container">
                <PersonalInfoForm />
            </div>

            <button className="go-back-button" onClick={() => navigate(-1)}>
                Go Back Home
            </button>
        </div>
    );
}

export default ChangePersonalDataPage;