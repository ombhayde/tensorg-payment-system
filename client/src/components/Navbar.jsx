import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ user, handleLogout }) => {
    const handleGoogleLogin = () => {
        window.open(`${import.meta.env.VITE_API_URL}/auth/google`, "_self");
    };

    const getUserFirstName = () => {
        if (!user) return '';
        const nameToSplit = user.displayName || user.email || 'User';
        return nameToSplit.split(' ')[0];
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <span className="brand-icon">🛍️</span>
                    TensorGo Shop
                </Link>
                <div className="navbar-menu">
                    {user ? (
                        <>
                            {user.isAdmin && (
                                <Link to="/admin" className="navbar-link admin-link">
                                    <span className="admin-badge">Admin</span>
                                    Dashboard
                                </Link>
                            )}
                            <div className="user-info">
                                <span className="user-avatar">{getUserFirstName().charAt(0).toUpperCase()}</span>
                                <span className="navbar-user">Hi, {getUserFirstName()}</span>
                            </div>
                            <button onClick={handleLogout} className="btn btn-logout">
                                <span className="logout-icon">⏻</span>
                                Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={handleGoogleLogin} className="btn btn-google">
                            <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google icon"/>
                            Sign in with Google
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;