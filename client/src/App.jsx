import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import './App.css';

// Configure axios to send credentials (cookies) with every request
axios.defaults.withCredentials = true;

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user`);
                setUser(response.data);
            } catch (error) {
                console.log('No user logged in');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/logout`);
            setUser(null);
            // Redirect to home or refresh
            window.location = "/";
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return <div>Loading Application...</div>;
    }

    return (
        <Router>
            <Navbar user={user} handleLogout={handleLogout} />
            <main>
                <Routes>
                    <Route path="/" element={<HomePage user={user} />} />
                    <Route path="/admin" element={<AdminDashboard user={user} />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/cancel" element={<Cancel />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;