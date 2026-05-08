import React, { useEffect, useState } from 'react';
import axios from "../../api";
import ProductCard from '../product/ProductCard';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Page = styled.div`
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 20px;
`;

const Header = styled.div`
    margin-bottom: 24px;
`;

const Title = styled.h1`
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 6px;
`;

const Subtitle = styled.p`
    color: #666;
    font-size: 14px;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
`;

const Center = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 20px;
    text-align: center;
    color: #555;
`;

const Button = styled.button`
    margin-top: 16px;
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    background: #22c55e;
    color: white;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background: #16a34a;
    }
`;

const LoadingBox = styled.div`
    padding: 40px;
    text-align: center;
    color: #666;
`;

const ErrorBox = styled.div`
    padding: 16px;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 10px;
`;

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

        axios.get('/api/user/favorites', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(res => {
                setFavorites(res.data);
                setError(null);
            })
            .catch(err => {
                console.error(err);
                if (err.response?.data?.message === "Invalid token") {
                    console.log("Token invalid → logging out");
                    localStorage.removeItem('token');
                    window.location.href = '/login'; // or navigate
                } else {
                    console.error("Fetch favorites failed:", err.response?.data || err.message);
                    setError('Failed to load favorites');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // 🔒 Not logged in
    if (!isAuthenticated) {
        return (
            <Center>
                <h2>Sign in required</h2>
                <p>Log in to save and view your favorite products.</p>
                <Button onClick={() => navigate('/account')}>
                    Sign in
                </Button>
            </Center>
        );
    }

    // ⏳ Loading
    if (loading) {
        return <LoadingBox>Loading your favorites...</LoadingBox>;
    }

    // ❌ Error
    if (error) {
        return (
            <Page>
                <ErrorBox>{error}</ErrorBox>
            </Page>
        );
    }

    return (
        <Page>
            <Header>
                <Title>My Favorites</Title>
                <Subtitle>
                    Quickly access the products you save for later
                </Subtitle>
            </Header>

            {favorites.length === 0 ? (
                <Center>
                    <h3>No favorites yet</h3>
                    <p>Tap the heart icon on products to save them here.</p>
                    <Button onClick={() => navigate('/')}>
                        Browse products
                    </Button>
                </Center>
            ) : (
                <Grid>
                    {favorites.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                        />
                    ))}
                </Grid>
            )}
        </Page>
    );
};

export default FavoritePage;