import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ListPreview from '../user/ListPreview';
import { useNavigate } from 'react-router-dom';

const ListPage = () => {
    const [lists, setLists] = useState([]);
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

        const fetchLists = async () => {
            try {
                const response = await axios.get('/api/user/lists', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLists(response.data);
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error('Error fetching lists:', error);
                setError('Failed to load shopping lists.');
            } finally {
                setLoading(false);
            }
        };

        fetchLists();
    }, []);

    if (!isAuthenticated) {
        return (
            <div>
                <p>Log in to view and customize your shopping lists.</p>
                <button onClick={() => navigate('/account')}>Sign In</button>
            </div>
        );
    }

    if (loading) return <p>Loading your shopping lists...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>My Shopping Lists</h2>
            {lists.length > 0 ? (
                lists.map(list => (
                    <ListPreview key={list._id} list={list} />
                ))
            ) : (
                <p>You don't have any shopping lists yet. Start adding some!</p>
            )}
        </div>
    );
};

export default ListPage;