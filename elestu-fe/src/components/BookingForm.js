// src/components/BookingForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import '../App.css';

function BookingForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const [studio, setStudio] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [description, setDescription] = useState('');

    // --- Add state for userEmail and currentUserId ---
    const [userEmail, setUserEmail] = useState(''); // State to store the logged-in user's email
    const [currentUserId, setCurrentUserId] = useState(null); // State to store the logged-in user's ID (as a number)
    // --- End of new state ---

    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const { studio } = location.state || {};
        if (!studio) {
            navigate('/studios'); // Redirect if no studio data
        } else {
            setStudio(studio);
        }

        // --- AUTHENTICATION LOGIC: Fetch user data from localStorage ---
        // You MUST replace this with how your actual authentication stores user data.
        const storedUserId = localStorage.getItem('userId'); // Assuming userId is stored as a string
        const storedUserEmail = localStorage.getItem('userEmail'); // Assuming userEmail is stored as a string

        if (storedUserId) {
            // Convert userId to a number, as the backend expects an integer
            setCurrentUserId(parseInt(storedUserId, 10));
        } else {
            // If userId is not found, it means the user is not logged in or data is missing
            setError('User ID not found. Please log in to make a booking.');
            // Optionally, navigate to login page: navigate('/login');
        }

        if (storedUserEmail) {
            setUserEmail(storedUserEmail);
        } else {
            setError('User email not found. Please log in to make a booking.');
            // Optionally, navigate to login page: navigate('/login');
        }
        // --- END AUTHENTICATION LOGIC ---

    }, [navigate, location.state]); // Dependencies for useEffect

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setBookingSuccess(false);

        // --- Frontend validation including user data ---
        if (!selectedDate || !selectedTime || !description || !userEmail || currentUserId === null) {
            setError('Please fill in all booking details and ensure you are logged in.');
            // For debugging, you can console.log the values:
            console.log({ selectedDate, selectedTime, description, userEmail, currentUserId });
            return;
        }
        // --- End frontend validation ---

        const bookingDetails = {
            studioId: studio.id,
            studioName: studio.name,
            date: selectedDate,
            time: selectedTime,
            description: description,
            pricePerHour: studio.price,
            userEmail: userEmail,       // <--- Send the user's email
            userId: currentUserId,       // <--- Send the user's ID
        };

        try {
            const response = await fetch('http://localhost:3000/api/bookings', { // Your backend endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // If you use JWTs, you might also need to send an Authorization header:
                    // 'Authorization': `Bearer ${localStorage.getItem('yourAuthTokenKey')}`,
                },
                body: JSON.stringify(bookingDetails),
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Log the full error response from backend for better debugging
                console.error("Backend error response:", errorData);
                throw new Error(errorData.message || 'Failed to submit booking.');
            }

            setBookingSuccess(true);
            setSelectedDate('');
            setSelectedTime('');
            setDescription('');
            // Do NOT clear userEmail or currentUserId if they come from session/auth,
            // as they represent the logged-in user.

        } catch (err) {
            console.error('Booking submission error:', err);
            setError(`Error submitting booking: ${err.message}`);
        }
    };

    if (!studio) {
        return (
            <div className="booking-page-container">
                <Navbar />
                <h2 className="booking-form-title">Cargando formulario de reserva...</h2>
            </div>
        );
    }

    // Optional: Render a message if user is not logged in
    if (currentUserId === null || userEmail === '') {
        return (
            <div className="booking-page-container">
                <Navbar />
                <h2 className="booking-form-title">Login Required</h2>
                <p className="booking-error-message">Please log in to make a booking. User ID or Email not found.</p>
                {error && <p className="booking-error-message">{error}</p>}
                {/* You might add a link/button to your login page here */}
                <button onClick={() => navigate('/login')} className="submit-booking-button">Go to Login</button>
            </div>
        );
    }

    return (
        <div className="booking-page-container">
            <Navbar />
            <h2 className="booking-form-title">Book Studio: {studio.name}</h2>
            <div className="booking-form-container">
                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                        <label htmlFor="date">Select Date:</label>
                        <input
                            type="date"
                            id="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="time">Select Time:</label>
                        <input
                            type="time"
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            required
                        />
                    </div>
                    {/* Display user email but make it read-only, as it comes from auth */}
                    <div className="form-group">
                        <label htmlFor="userEmail">Your Email:</label>
                        <input
                            type="email"
                            id="userEmail"
                            value={userEmail}
                            readOnly // User should not be able to change their logged-in email here
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Brief Description of your needs:</label>
                        <textarea
                            id="description"
                            rows="5"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., 'Mixing and mastering session for an EP', 'Vocal recording for a single', 'Band rehearsal'"
                            required
                        ></textarea>
                    </div>

                    {error && <p className="booking-error-message">{error}</p>}
                    {bookingSuccess && <p className="booking-success-message">Booking submitted successfully! We will contact you soon.</p>}

                    <button type="submit" className="submit-booking-button">Confirm Booking</button>
                </form>
            </div>
        </div>
    );
}

export default BookingForm;