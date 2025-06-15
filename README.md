# 🎵 EleStu - Marketplace para la Industria Musical

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=stripe&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

**EleStu** es una plataforma web todo en uno diseñada como Proyecto de Fin de Ciclo para **2º de Desarrollo de Aplicaciones Web**. Su objetivo es centralizar los servicios del sector musical, conectando a artistas, productores, ingenieros de sonido y estudios de grabación en un único lugar.

El proyecto nace de la necesidad de unificar un mercado disperso, ofreciendo una solución moderna, intuitiva y eficiente para facilitar la colaboración y contratación de talento en el mundo de la música.

## 🚀 Enlaces del Proyecto

* **Frontend (Vercel):** [**ele-stu.vercel.app**](https://ele-stu.vercel.app)
* **Backend (Render):** [**elestu.onrender.com**](https://elestu.onrender.com)

## ✨ Características Principales

* **Autenticación Completa:** Registro e inicio de sesión local seguro (JWT) y mediante proveedores externos como **Google (OAuth 2.0)**.
* **Marketplace de Servicios:** Los profesionales (músicos, productores, etc.) pueden publicar sus servicios para ser contratados.
* **Alquiler de Estudios:** Los estudios de grabación pueden listar sus espacios, mostrando detalles y permitiendo reservas.
* **Pasarela de Pagos Segura:** Integración completa con **Stripe** para procesar transacciones de forma segura (compatible con PCI).
* **Búsqueda y Filtrado Avanzado:** Herramientas de búsqueda para encontrar fácilmente los servicios o estudios necesarios.
* **Perfiles de Usuario:** Cada usuario tiene un panel personal para gestionar su información, seguridad y reservas.
* **Diseño Responsivo:** Interfaz adaptable a cualquier dispositivo (escritorio, tablet y móvil).
* **Accesibilidad Web:** Integración del widget de **UserWay** para cumplir con las pautas WCAG y garantizar una experiencia inclusiva.


## 🛠️ Stack Tecnológico

La aplicación sigue una arquitectura de 3 capas con tecnologías modernas y escalables.

#### Frontend
* **React:** Biblioteca principal para la construcción de la interfaz de usuario.
* **React Router:** Para la gestión de rutas en la Single Page Application (SPA).
* **Axios:** Para realizar las peticiones a la API del backend.
* **Despliegue:** **Vercel**.

#### Backend
* **NestJS:** Framework de Node.js sobre TypeScript para una arquitectura modular y robusta.
* **TypeORM:** ORM para la interacción con la base de datos.
* **PostgreSQL:** Base de datos relacional para la persistencia de los datos.
* **JWT (JSON Web Tokens):** Para la gestión de la autenticación y sesiones seguras.
* **Bcrypt:** (Planificado) Para el hasheo seguro de contraseñas.
* **Despliegue:** **Render**.

#### APIs y Servicios Externos
* **Stripe:** Para la gestión de todos los pagos y transacciones.
* **Google Maps API:** Para la geolocalización de estudios.
* **Google OAuth 2.0:** Para el inicio de sesión con cuentas de Google.
* **UserWay:** Para el widget de accesibilidad.

## ⚙️ Instalación y Puesta en Marcha Local

Sigue estos pasos para ejecutar el proyecto en tu máquina local.

### Requisitos Previos
* Node.js (v18 o superior)
* npm o yarn
* PostgreSQL
* Git

### 1. Backend (NestJS)

```bash
# Clona el repositorio del backend
git clone [https://github.com/Ayoubb4/EleStu.git](https://github.com/Ayoubb4/EleStu.git)

# Entra en el directorio
cd EleStu

# Instala las dependencias
npm install
