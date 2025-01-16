import React, { useEffect, useState } from 'react';
import axios from "axios";
import ProductCard from '../product/ProductCard';
import { useNavigate } from 'react-router-dom';

const FavoritePage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            return;
        }

        setIsAuthenticated(true);
        setLoading(true);

        const fetchFavorites = async () => {
            try {
                const response = await axios.get('/api/user/favorites', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFavorites(response.data);
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error('Error fetching favorites:', error);
                setError('Failed to load favorites.');
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (!isAuthenticated) {
        return (
            <div>
                <p>Log in to customize and view your favorites.</p>
                <button onClick={() => navigate('/account')}>Sign In</button>
            </div>
        );
    }

    if (loading) return <p>Loading your favorites...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>My Favorites</h2>
            {favorites.length > 0 ? (
                <div className="product-list">
                    {favorites.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <p>You don't have any favorites yet. Add some products to your favorites!</p>
            )}
        </div>
    );
};

export default FavoritePage;