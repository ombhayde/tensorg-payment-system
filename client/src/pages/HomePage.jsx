import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import './HomePage.css';

const stripePromise = loadStripe('pk_test_51RmEnDEOs5Iu5QZQuOQ8PGPobiPQzX3iwzqWiAICjsYKdE8Qe6d2EK4b73dEraglqlUM6ftWKPdCHxyJwvCdQlba00RzZQQMUq');

const ProductCard = ({ product, user }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleBuyNow = async () => {
        if (!user) {
            alert('Please sign in to make a purchase.');
            return;
        }
        
        setIsLoading(true);
        try {
            const stripe = await stripePromise;
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/create-checkout-session`, { product, user });
            const session = response.data;
            const result = await stripe.redirectToCheckout({ sessionId: session.id });
            if (result.error) {
                alert(result.error.message);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="product-card">
            <div className="product-image-container">
                <img className="product-image" src={product.image} alt={product.name} />
                <div className="product-overlay">
                    <span className="quick-view">Quick View</span>
                </div>
            </div>
            <div className="product-info">
                <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-rating">
                        <span className="stars">★★★★★</span>
                        <span className="rating-count">(127)</span>
                    </div>
                </div>
                <div className="price-container">
                    <p className="product-price">₹{(product.price / 100).toFixed(2)}</p>
                    <span className="price-label">Best Price</span>
                </div>
                <button onClick={handleBuyNow} className={`btn-buy ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <span className="cart-icon">🛒</span>
                            Buy Now
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="loading-container">
        <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
        </div>
        <h2 className="loading-text">Discovering Amazing Products...</h2>
        <p className="loading-subtext">Please wait while we fetch the latest items for you</p>
    </div>
);

const HomePage = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
                if (Array.isArray(response.data)) {
                    setProducts(response.data);
                } else {
                    console.error("API response for products is not an array:", response.data);
                    setProducts([]);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container homepage">
            <div className="hero-section">
                <h1 className="homepage-title">
                    <span className="title-highlight">Our Premier</span>
                    <span className="title-main">Solutions</span>
                </h1>
                <p className="homepage-subtitle">
                    Discover cutting-edge technology solutions designed to transform your business
                </p>
                <div className="stats-row">
                    <div className="stat-item">
                        <span className="stat-number">{products.length}+</span>
                        <span className="stat-label">Products</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">1000+</span>
                        <span className="stat-label">Happy Clients</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Support</span>
                    </div>
                </div>
            </div>
            
            <div className="products-section">
                <div className="section-header">
                    <h2 className="section-title">Featured Products</h2>
                    <div className="section-divider"></div>
                </div>
                <div className="product-grid">
                    {products.map((product, index) => (
                        <div key={product.id} className="product-wrapper" style={{'--delay': `${index * 0.1}s`}}>
                            <ProductCard product={product} user={user} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;