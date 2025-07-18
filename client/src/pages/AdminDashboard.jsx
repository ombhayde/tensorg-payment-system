import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const LoadingDashboard = () => (
    <div className="loading-dashboard">
        <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
        </div>
        <h2 className="loading-text">Loading Dashboard...</h2>
        <p className="loading-subtext">Fetching latest sales data</p>
    </div>
);

const ErrorDisplay = ({ error }) => (
    <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Access Denied</h2>
        <p className="error-message">{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
            🔄 Retry
        </button>
    </div>
);

const StatsCard = ({ icon, title, value, subtitle, trend }) => (
    <div className="stats-card">
        <div className="stats-icon">{icon}</div>
        <div className="stats-content">
            <h3 className="stats-title">{title}</h3>
            <p className="stats-value">{value}</p>
            <p className="stats-subtitle">{subtitle}</p>
            {trend && (
                <div className={`stats-trend ${trend.direction}`}>
                    <span className="trend-icon">{trend.direction === 'up' ? '📈' : '📉'}</span>
                    <span className="trend-text">{trend.text}</span>
                </div>
            )}
        </div>
    </div>
);

const AdminDashboard = ({ user }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/orders`, { withCredentials: true });
                setOrders(response.data);
            } catch (err) {
                setError('Failed to fetch orders. You might not have access.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    const filteredAndSortedOrders = useMemo(() => {
        let filtered = orders.filter(order =>
            order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.productName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return filtered.sort((a, b) => {
            if (sortConfig.key === 'date') {
                const aDate = new Date(a.date);
                const bDate = new Date(b.date);
                return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
            }
            if (sortConfig.key === 'amount') {
                return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
            if (sortConfig.key === 'userEmail' || sortConfig.key === 'productName') {
                const aValue = a[sortConfig.key].toLowerCase();
                const bValue = b[sortConfig.key].toLowerCase();
                if (sortConfig.direction === 'asc') {
                    return aValue.localeCompare(bValue);
                }
                return bValue.localeCompare(aValue);
            }
            return 0;
        });
    }, [orders, searchTerm, sortConfig]);

    const statistics = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
        const totalOrders = orders.length;
        const uniqueCustomers = new Set(orders.map(order => order.userEmail)).size;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalRevenue,
            totalOrders,
            uniqueCustomers,
            avgOrderValue
        };
    }, [orders]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const exportToCSV = () => {
        const csvContent = [
            ['User Email', 'Product Name', 'Amount (₹)', 'Date'],
            ...filteredAndSortedOrders.map(order => [
                order.userEmail,
                order.productName,
                (order.amount / 100).toFixed(2),
                new Date(order.date).toLocaleString()
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) return <LoadingDashboard />;
    if (error) return <ErrorDisplay error={error} />;

    return (
        <div className="container admin-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1 className="dashboard-title">
                        <span className="title-icon">📊</span>
                        Sales Dashboard
                    </h1>
                    <p className="dashboard-subtitle">
                        Monitor your business performance and track sales metrics
                    </p>
                </div>
                <div className="header-actions">
                    <button onClick={exportToCSV} className="export-btn">
                        📥 Export CSV
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                <StatsCard
                    icon="💰"
                    title="Total Revenue"
                    value={`₹${(statistics.totalRevenue / 100).toLocaleString()}`}
                    subtitle="All time earnings"
                    trend={{ direction: 'up', text: '+12% from last month' }}
                />
                <StatsCard
                    icon="📦"
                    title="Total Orders"
                    value={statistics.totalOrders.toLocaleString()}
                    subtitle="Completed transactions"
                    trend={{ direction: 'up', text: '+8% from last month' }}
                />
                <StatsCard
                    icon="👥"
                    title="Unique Customers"
                    value={statistics.uniqueCustomers.toLocaleString()}
                    subtitle="Active customer base"
                    trend={{ direction: 'up', text: '+15% from last month' }}
                />
                <StatsCard
                    icon="📈"
                    title="Avg Order Value"
                    value={`₹${(statistics.avgOrderValue / 100).toFixed(0)}`}
                    subtitle="Per transaction"
                    trend={{ direction: 'up', text: '+5% from last month' }}
                />
            </div>

            <div className="orders-section">
                <div className="section-header">
                    <h2 className="section-title">Recent Orders</h2>
                    <div className="search-container">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search orders by email or product..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('userEmail')} className="sortable">
                                    <span>User Email</span>
                                    <span className="sort-indicator">
                                        {sortConfig.key === 'userEmail' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                                    </span>
                                </th>
                                <th onClick={() => handleSort('productName')} className="sortable">
                                    <span>Product Name</span>
                                    <span className="sort-indicator">
                                        {sortConfig.key === 'productName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                                    </span>
                                </th>
                                <th onClick={() => handleSort('amount')} className="sortable">
                                    <span>Amount</span>
                                    <span className="sort-indicator">
                                        {sortConfig.key === 'amount' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                                    </span>
                                </th>
                                <th onClick={() => handleSort('date')} className="sortable">
                                    <span>Date</span>
                                    <span className="sort-indicator">
                                        {sortConfig.key === 'date' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕️'}
                                    </span>
                                </th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedOrders.length > 0 ? (
                                filteredAndSortedOrders.map((order, index) => (
                                    <tr key={order._id} style={{'--delay': `${index * 0.05}s`}}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {order.userEmail.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="user-email">{order.userEmail}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="product-name">{order.productName}</span>
                                        </td>
                                        <td>
                                            <span className="amount">₹{(order.amount / 100).toFixed(2)}</span>
                                        </td>
                                        <td>
                                            <span className="date">{new Date(order.date).toLocaleString()}</span>
                                        </td>
                                        <td>
                                            <span className="status-badge completed">Completed</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        <div className="no-data-content">
                                            <span className="no-data-icon">📭</span>
                                            <p>No orders found matching your search</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;