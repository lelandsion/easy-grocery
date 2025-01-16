// src/components/product/ProductCarousel.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

// Styled components for carousel
const CarouselContainer = styled.div`
    display: flex;
    overflow-x: auto;
    padding: 1em;
    background-color: #f8f8f8;
    border-radius: 8px;
`;

const CarouselItem = styled.div`
    min-width: 200px;
    margin-right: 1em;
    padding: 1em;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ProductImage = styled.img`
    height: 300px;   /* Set a fixed height for consistency */
    width: 300px;
    object-fit: cover;  /* Ensures the image covers the entire area without distortion */
    border-radius: 8px;
`;

// Product Carousel Component
const ProductCarousel = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch list of products from the backend
        axios.get('/api/products')
            .then(response => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setError('Failed to load products');
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading products...</p>;
    if (error) return <p>{error}</p>;

    return (
        <CarouselContainer>
            {products.slice(0, 10).map(product => (
                <CarouselItem key={product._id}>
                    <ProductImage src={product.image_url || '/path/to/default-image.png'} alt={product.name} />
                    <h3>{product.name}</h3>
                    <p>${product.price}</p>
                </CarouselItem>
            ))}
        </CarouselContainer>
    );
};

export default ProductCarousel;