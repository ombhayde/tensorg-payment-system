import React from 'react';
import { Link } from 'react-router-dom';

const Cancel = () => (
    <div className="flex flex-col items-center justify-center h-screen text-center -mt-20">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Cancelled! ❌</h1>
        <p className="text-lg text-gray-700 mb-6">Your order was not processed. You have not been charged.</p>
        <Link to="/" className="px-6 py-3 bg-secondary text-white rounded-md hover:bg-gray-600 transition-colors">
            Return to Shop
        </Link>
    </div>
);

export default Cancel;