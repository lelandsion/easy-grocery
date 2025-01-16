// src/components/pages/StoreListPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

// Styled components for store cards
const StoreListContainer = styled.div`
    padding: 2em;
`;

const StoreCard = styled(Link)`
    display: flex;
    align-items: center;
    padding: 1em;
    background-color: #f9f9f9;
    margin: 1em 0;
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

    &:hover {
        background-color: #eef;
    }
`;

const StoreLogo = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 1em;
    object-fit: cover;
`;

const StoreDetails = styled.div`
    display: flex;
    flex-direction: column;
`;

const StoreName = styled.h3`
    margin: 0;
`;

const StoreDescription = styled.p`
    margin: 0;
    color: #666;
`;

const LoadingMessage = styled.p`
    font-size: 1.2em;
    color: #555;
`;

const ErrorMessage = styled.p`
    font-size: 1.2em;
    color: red;
`;

const StoreListPage = () => {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch list of stores from the backend
        axios.get('/api/stores')
            .then(response => {
                setStores(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching stores:', error);
                setError('Failed to load stores');
                setLoading(false);
            });
    }, []);

    if (loading) return <LoadingMessage>Loading stores...</LoadingMessage>;
    if (error) return <ErrorMessage>{error}</ErrorMessage>;

    return (
        <StoreListContainer>
            <h2>Available Stores</h2>
            {stores.map(store => (
                <StoreCard to={`/stores/${store._id}`} key={store._id}>
                    <StoreLogo src={store.logo || '/path/to/default-logo.png'} alt={`${store.name} logo`} />
                    <StoreDetails>
                        <StoreName>{store.name}</StoreName>
                        <StoreDescription>{store.description || "No description available."}</StoreDescription>
                    </StoreDetails>
                </StoreCard>
            ))}
        </StoreListContainer>
    );
};

export default StoreListPage;