import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Success.css';

const ConfettiParticle = ({ delay }) => (
    <div 
        className="confetti-particle" 
        style={{'--delay': `${delay}s`, '--random': Math.random()}}
    />
);

const Success = () => {
    const [showConfetti, setShowConfetti] = useState(true);
    
    useEffect(() => {
        // Hide confetti after animation completes
        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 4000);
        
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="success-container">
            {showConfetti && (
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <ConfettiParticle key={i} delay={i * 0.1} />
                    ))}
                </div>
            )}
            
            <div className="success-content">
                <div className="success-icon-container">
                    <div className="success-circle">
                        <div className="checkmark">
                            <div className="checkmark-stem"></div>
                            <div className="checkmark-kick"></div>
                        </div>
                    </div>
                </div>
                
                <div className="success-message">
                    <h1 className="success-title">
                        <span className="title-main">Payment Successful!</span>
                        <span className="success-emoji">🎉</span>
                    </h1>
                    
                    <div className="success-details">
                        <p className="success-subtitle">
                            Thank you for your purchase! Your order has been confirmed and is being processed.
                        </p>
                        
                        <div className="success-info">
                            <div className="info-item">
                                <span className="info-icon">📧</span>
                                <span className="info-text">Confirmation email sent</span>
                            </div>
                            <div className="info-item">
                                <span className="info-icon">🔔</span>
                                <span className="info-text">Admin has been notified</span>
                            </div>
                            <div className="info-item">
                                <span className="info-icon">⚡</span>
                                <span className="info-text">Processing will begin shortly</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="success-actions">
                    <Link to="/" className="home-button">
                        <span className="button-icon">🏠</span>
                        <span className="button-text">Back to Home</span>
                        <div className="button-shine"></div>
                    </Link>
                    
                    <div className="additional-actions">
                        <button className="action-button secondary" onClick={() => window.print()}>
                            <span className="button-icon">🖨️</span>
                            Print Receipt
                        </button>
                        <button className="action-button secondary" onClick={() => navigator.share && navigator.share({title: 'Purchase Successful', text: 'I just made a successful purchase!'})}>
                            <span className="button-icon">📱</span>
                            Share
                        </button>
                    </div>
                </div>
                
                <div className="success-footer">
                    <p className="footer-text">
                        Need help? <a href="/support" className="support-link">Contact Support</a>
                    </p>
                </div>
            </div>
            
            <div className="floating-elements">
                <div className="floating-element" style={{'--delay': '0s'}}>💎</div>
                <div className="floating-element" style={{'--delay': '1s'}}>⭐</div>
                <div className="floating-element" style={{'--delay': '2s'}}>🎊</div>
                <div className="floating-element" style={{'--delay': '1.5s'}}>✨</div>
                <div className="floating-element" style={{'--delay': '0.5s'}}>🎈</div>
            </div>
        </div>
    );
};

export default Success;