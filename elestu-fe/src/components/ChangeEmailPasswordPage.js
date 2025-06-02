import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function ChangeEmailPasswordPage() {
    const navigate = useNavigate();

    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailVerificationCode, setEmailVerificationCode] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [message, setMessage] = useState('');

    const [showVerificationCodeInput, setShowVerificationCodeInput] = useState(false);

    useEffect(function() {
        async function fetchUserData() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                const response = await axios.get('http://localhost:3000/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setCurrentEmail(response.data.email);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setMessage('Error al cargar la información del usuario.');
                if (error.response && error.response.status === 401) {
                    navigate('/login');
                }
            }
        }
        fetchUserData();
    }, [navigate]);

    async function requestVerificationCode() {
        setMessage('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:3000/auth/request-email-verification', {
                oldEmail: currentEmail,
                newEmail: newEmail,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Código de verificación enviado a tu email actual. Por favor, revísalo.');
            setShowVerificationCodeInput(true);
        } catch (error) {
            console.error('Error al solicitar código de verificación:', error);
            setMessage('Error al solicitar el código de verificación. Asegúrate de que el email nuevo es válido y diferente.');
        }
    }

    async function handleChangeEmail(e) {
        e.preventDefault();
        setMessage('');

        if (newEmail && !emailVerificationCode) {
            await requestVerificationCode();
            return;
        }

        if (newEmail && emailVerificationCode) {
            if (newEmail === currentEmail) {
                setMessage('El nuevo email no puede ser igual al actual.');
                return;
            }
            try {
                const token = localStorage.getItem('token');
                await axios.patch('http://localhost:3000/users/change-email', {
                    oldEmail: currentEmail,
                    newEmail: newEmail,
                    verificationCode: emailVerificationCode,
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessage('Email actualizado exitosamente.');
                setCurrentEmail(newEmail);
                setNewEmail('');
                setEmailVerificationCode('');
                setShowVerificationCodeInput(false);
            } catch (error) {
                console.error('Error al cambiar email:', error);
                setMessage('Error al cambiar el email. Verifica el código o intenta de nuevo.');
            }
        } else {
            setMessage('Por favor, introduce el nuevo email y/o el código de verificación.');
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        setMessage('');

        if (newPassword !== confirmNewPassword) {
            setMessage('Las nuevas contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setMessage('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.patch('http://localhost:3000/users/change-password', {
                currentPassword: currentPassword,
                newPassword: newPassword,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Contraseña actualizada exitosamente.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            console.error('Error al cambiar contraseña:', error);
            setMessage('Error al cambiar la contraseña. Verifica tu contraseña actual.');
        }
    }

    return (
        <div className="settings-page-detail">
            <h1 className="settings-detail-title">Configuración</h1>

            <div className="settings-form-container">
                <section className="settings-detail-section">
                    <h2>Change Email</h2>
                    <form onSubmit={handleChangeEmail} className="settings-detail-form">
                        <label>
                            Current Email:
                            <input
                                type="email"
                                value={currentEmail}
                                readOnly
                                className="read-only-input"
                            />
                        </label>
                        <label>
                            New Email:
                            <input
                                type="email"
                                value={newEmail}
                                onChange={function(e) { setNewEmail(e.target.value); }}
                                required={!showVerificationCodeInput}
                            />
                        </label>
                        {showVerificationCodeInput && (
                            <label>
                                Verification Code:
                                <input
                                    type="text"
                                    value={emailVerificationCode}
                                    onChange={function(e) { setEmailVerificationCode(e.target.value); }}
                                    required
                                />
                            </label>
                        )}
                        <button type="submit">
                            {newEmail && !showVerificationCodeInput ? 'Send Verification Code' : 'Update Email'}
                        </button>
                    </form>
                </section>

                <section className="settings-detail-section">
                    <h2>Change Password</h2>
                    <form onSubmit={handleChangePassword} className="settings-detail-form">
                        <label>
                            Current Password:
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={function(e) { setCurrentPassword(e.target.value); }}
                                required
                            />
                        </label>
                        <label>
                            New Password:
                            <input
                                type="password"
                                value={newPassword}
                                onChange={function(e) { setNewPassword(e.target.value); }}
                                required
                            />
                        </label>
                        <label>
                            Confirm New Password:
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={function(e) { setConfirmNewPassword(e.target.value); }}
                                required
                            />
                        </label>
                        <button type="submit">Update Password</button>
                    </form>
                </section>
            </div>

            {message && <p className="form-message">{message}</p>}

            <div className="settings-buttons-group">
                <button className="save-button" onClick={function() { alert('¡Funcionalidad de guardar general!'); }}>
                    Save
                </button>
                <button className="go-back-button" onClick={function() { navigate('/settings'); }}>
                    Go Back Home
                </button>
            </div>
        </div>
    );
}

export default ChangeEmailPasswordPage;
