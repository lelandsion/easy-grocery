// src/components/product/ProductCarousel.js

import { useNavigate, Link } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import axios from "../../api";
import styled from 'styled-components';

/* ================= STORE MAP ================= */

const STORE_MAP = {
    "6732efc8132efbd2898fdc6d": {
        name: "Costco",
        logo: "/costco-logo.png"
    },
    "6732efc8132efbd2898fdc70": {
        name: "IGA",
        logo: "/iga-logo.png"
    },
    "6732efc8132efbd2898fdc6f": {
        name: "Loblaws",
        logo: "/loblaws-logo.png"
    },
    "6732efc8132efbd2898fdc6c": {
        name: "Walmart",
        logo: "/walmart-logo.svg"
    },
    "6732efc8132efbd2898fdc6e": {
        name: "Whole Foods",
        logo: "/whole-foods-market-logo.png"
    }
};

/* ================= STYLES ================= */

const CarouselContainer = styled.div`
    display: flex;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding: 8px 4px 16px;
    gap: 16px;

    &::-webkit-scrollbar {
        height: 8px;
    }

    &::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 999px;
    }
`;

const CarouselItem = styled.div`
    position: relative;
    min-width: 220px;
    max-width: 220px;
    padding: 12px;
    background: #fff;
    border: 1px solid #eeeeee;
    border-radius: 16px;
    cursor: pointer;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
    transition: all 0.15s ease;
    overflow: hidden;

    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 14px 30px rgba(15, 23, 42, 0.10);
    }

    /* easy shine effect */
    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: -120%;
        width: 60%;
        height: 100%;
        background: linear-gradient(
                120deg,
                transparent,
                rgba(255, 255, 255, 0.55),
                transparent
        );
        transform: skewX(-20deg);
        transition: left 0.6s ease;
        pointer-events: none;
    }

    &:hover::after {
        left: 130%;
    }
`;

const ImageWrapper = styled.div`
    position: relative;
`;

const ProductImage = styled.img`
    height: 150px;
    width: 100%;
    object-fit: cover;
    border-radius: 12px;
    margin-bottom: 10px;
    background: #f3f4f6;
`;

const DealBadge = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 5;
    background: #ef4444;
    color: white;
    font-size: 11px;
    padding: 4px 7px;
    border-radius: 999px;
    font-weight: 700;
`;

const StoreBadge = styled(Link)`
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 6;

    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(6px);

    border-radius: 999px;
    border: 1px solid rgba(0,0,0,0.06);

    text-decoration: none;
    color: #111;
    transition: all 0.15s ease;

    &:hover {
        transform: translateY(-1px);
        background: rgba(255, 255, 255, 0.97);
    }
`;

const StoreLogo = styled.img`
    width: 16px;
    height: 16px;
    object-fit: cover;
    border-radius: 50%;
`;

const StoreName = styled.span`
    font-size: 11px;
    color: #555;
    white-space: nowrap;
`;

const ProductName = styled.h3`
    font-size: 14px;
    line-height: 1.35;
    font-weight: 600;
    color: #111827;
    margin-bottom: 8px;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const Price = styled.p`
    font-size: 16px;
    font-weight: 800;
    color: #111827;
    margin: 0 0 8px;
`;

const DealInfo = styled.div`
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
`;

const Savings = styled.p`
    font-size: 13px;
    font-weight: 700;
    color: #16a34a;
    margin: 0;
`;

const CheaperText = styled.p`
    font-size: 12px;
    color: #666;
    margin: 0;
    line-height: 1.4;
`;

const AvgText = styled.p`
    font-size: 11px;
    color: #888;
    margin: 0;
`;

const LoadingCard = styled.div`
    background: white;
    border: 1px solid #eee;
    border-radius: 16px;
    padding: 16px;
    color: #6b7280;
`;

const ProductCarousel = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);

    useEffect(() => {
        let isMounted = true;

        axios.get('/api/deals')
            .then(res => {
                if (!isMounted) return;
                setProducts(Array.isArray(res.data) ? res.data : []);
                setLoading(false);
            })
            .catch(err => {
                if (!isMounted) return;
                console.error('Error fetching deals:', err);
                setError(`Failed to load deals: ${err.response?.status || err.message}`);
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!products.length) return;

        const interval = setInterval(() => {
            if (!containerRef.current) return;

            const el = containerRef.current;
            const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 20;

            if (nearEnd) {
                el.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                el.scrollBy({ left: 480, behavior: 'smooth' });
            }
        }, 4500);

        return () => clearInterval(interval);
    }, [products.length]);

    if (loading) {
        return <LoadingCard>Loading deals...</LoadingCard>;
    }

    if (error) {
        return <LoadingCard>{error}</LoadingCard>;
    }

    if (!products.length) {
        return <LoadingCard>No deals found</LoadingCard>;
    }

    return (
        <CarouselContainer ref={containerRef}>
            {products.slice(0, 12).map((item) => {
                const product = item.product;

                if (!product) return null;

                const store =
                    typeof product.store === "object"
                        ? product.store
                        : STORE_MAP[product.store];

                const storeId =
                    typeof product.store === "object"
                        ? product.store?._id
                        : product.store;

                return (
                    <CarouselItem
                        key={product._id}
                        onClick={() => {
                            if (!product?._id) return;

                            navigate(`/products/${product._id}`, {
                                state: { deal: item }
                            });
                        }}
                    >
                        <ImageWrapper>
                            {store && (
                                <StoreBadge
                                    to={`/stores/${storeId}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <StoreLogo src={store.logo} alt={store.name} />
                                    <StoreName>{store.name}</StoreName>
                                </StoreBadge>
                            )}

                            {item.score > 0.15 && (
                                <DealBadge>
                                    🔥 {(item.score * 100).toFixed(0)}% OFF
                                </DealBadge>
                            )}

                            <ProductImage
                                src={product.image_url || '/placeholder.png'}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                            />
                        </ImageWrapper>

                        <ProductName>{product.name}</ProductName>

                        <Price>
                            ${Number(product.price || 0).toFixed(2)}
                        </Price>

                        <DealInfo>
                            <Savings>
                                Save ${Number(item.savings || 0).toFixed(2)}
                            </Savings>

                            <CheaperText>
                                {(Number(item.score || 0) * 100).toFixed(0)}% cheaper than average
                            </CheaperText>

                            <AvgText>
                                Avg price: ${Number(item.avg || 0).toFixed(2)}
                            </AvgText>
                        </DealInfo>
                    </CarouselItem>
                );
            })}
        </CarouselContainer>
    );
};

export default ProductCarousel;