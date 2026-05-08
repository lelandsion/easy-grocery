// src/components/store/StoreList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "../../api";
import styled from 'styled-components';

const StoreListContainer = styled.div`
    display: flex;
    gap: 1em;
    overflow-x: auto;
`;

const StoreCard = styled(Link)`
    min-width: 160px;
    background: white;
    border-radius: 12px;
    padding: 16px;
    text-align: center;
    text-decoration: none;
    color: #111;
    border: 1px solid #eee;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.08);
    }
`;

const StoreList = () => {
    const [stores, setStores] = useState([]);

    useEffect(() => {
        axios.get('/api/stores')
            .then(response => setStores(response.data))
            .catch(error => console.error('Error fetching stores:', error));
    }, []);

    return (
        <StoreListContainer>
            {stores.map(store => (
                <StoreCard to={`/stores/${store._id}`} key={store._id}>
                    <h4>{store.name}</h4>
                </StoreCard>
            ))}
        </StoreListContainer>
    );
};

export default StoreList;