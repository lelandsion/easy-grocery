// src/components/product/ProductCarousel.js
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import axios from "../../api";
import styled from 'styled-components';

/* ================= STYLES ================= */

const CarouselContainer = styled.div`
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 1em;
    background-color: #f8f8f8;
    border-radius: 8px;
    gap: 1em;
`;

const CarouselItem = styled.div`
    min-width: 200px;
    padding: 1em;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.15s ease;
    position: relative;

    &:hover {
        transform: scale(1.03);
    }
`;

const ProductImage = styled.img`
    height: 180px;
    width: 100%;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 8px;
`;

/* ================= COMPONENT ================= */

const ProductCarousel = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const containerRef = useRef(null);

    /* ================= FETCH DEALS ================= */

    useEffect(() => {
        axios.get('/api/deals')
            .then(res => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching deals:', err);
                setError('Failed to load deals');
                setError(`Failed to load deals: ${err.response?.status || err.message}`);
                setLoading(false);
            });
    }, []);

    /* ================= AUTO SCROLL ================= */

    useEffect(() => {
        if (!products.length) return;

        const interval = setInterval(() => {
            if (!containerRef.current) return;

            containerRef.current.scrollBy({
                left: 540,
                behavior: 'smooth'
            });

        }, 4000);

        return () => clearInterval(interval);
    }, [products.length]);

    /* ================= STATES ================= */

    if (loading) return <p>Loading deals...</p>;
    if (error) return <p>{error}</p>;
    if (!products.length) return <p>No deals found</p>;

    /* ================= RENDER ================= */

    return (
        <CarouselContainer ref={containerRef}>

            {products.slice(0, 30).map((item) => {
                const product = item.product;

                if (!product) return null;

                return (
                    <CarouselItem
                        key={product._id}
                        onClick={() => {
                            if (!product?._id) return;
                            navigate(`/products/${product._id}`, {
                                state: {
                                    deal: item
                                }
                            });
                        }}
                    >

                        {/* DEAL BADGE */}
                        {item.score > 0.15 && (
                            <div style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                background: '#ef4444',
                                color: 'white',
                                fontSize: 11,
                                padding: '3px 6px',
                                borderRadius: 6,
                                fontWeight: 600
                            }}>
                                🔥 {(item.score * 100).toFixed(0)}% OFF
                            </div>
                        )}

                        <ProductImage
                            src={product.image_url || '/placeholder.png'}
                            alt={product.name}
                        />

                        <h3 style={{ fontSize: 14 }}>
                            {product.name}
                        </h3>

                        <p style={{ fontWeight: 600 }}>
                            ${Number(product.price).toFixed(2)}
                        </p>

                        {/* DEAL INFO */}

                        <div style={{

                            marginTop: 8,

                            display: 'flex',

                            flexDirection: 'column',

                            gap: 4

                        }}>



                            <p style={{

                                fontSize: 13,

                                fontWeight: 600,

                                color: '#16a34a',

                                margin: 0

                            }}>

                                Save ${item.savings.toFixed(2)}

                            </p>

                            <p style={{

                                fontSize: 12,

                                color: '#666',

                                margin: 0,

                                lineHeight: 1.4

                            }}>

                                {(item.score * 100).toFixed(0)}% cheaper than average

                            </p>

                            <p style={{

                                fontSize: 11,

                                color: '#888',

                                margin: 0

                            }}>

                                Avg price: ${item.avg.toFixed(2)}

                            </p>

                        </div>


                    </CarouselItem>
                );
            })}

        </CarouselContainer>
    );
};

export default ProductCarousel;