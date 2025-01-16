// src/components/store/StoreList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const StoreListContainer = styled.div`
    display: flex;
    gap: 1em;
    overflow-x: auto;
`;

const StoreCard = styled(Link)`
    text-decoration: none;
    color: inherit;
    background: #f9f9f9;
    padding: 1em;
    border-radius: 8px;
    width: 150px;
    text-align: center;
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