// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

const container = document.getElementById('root');
const root = createRoot(container);

// --- AÑADIDO: Tu Client ID de Google va aquí ---
const GOOGLE_CLIENT_ID = "1084364232885-9b8vs0gi27huqidbi63of0r0fbe3dfqc.apps.googleusercontent.com";

root.render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Router>
                <App />
            </Router>
        </GoogleOAuthProvider>
    </React.StrictMode>
);