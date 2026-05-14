import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from "../../api";
import styled from 'styled-components';
import ProductCard from '../product/ProductCard';

/* ================= UI ================= */

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px;
`;

const Header = styled.div`
    margin-bottom: 24px;
`;

const StoreInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
`;

const Logo = styled.img`
    width: 60px;
    height: 60px;
    border-radius: 12px;
    object-fit: contain;
    background: white;
    padding: 6px;
    border: 1px solid #eee;
`;

const StoreText = styled.div``;

const StoreTitle = styled.h1`
    font-size: 28px;
    margin: 0;
`;

const Subtitle = styled.p`
    color: #666;
    margin-top: 4px;
    font-size: 14px;
`;

/* 🔥 AISLES */
const AisleBar = styled.div`
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 12px 0;
    margin-bottom: 20px;
`;

const AisleTab = styled.button`
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid #ddd;
    background: ${props => (props.active ? '#22c55e' : 'white')};
    color: ${props => (props.active ? 'white' : '#333')};
    cursor: pointer;
    white-space: nowrap;

    &:hover {
        border-color: #22c55e;
    }
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
`;

const Center = styled.div`
    text-align: center;
    padding: 60px 20px;
    color: #666;
`;

const Loading = styled.div`
    text-align: center;
    padding: 40px;
    color: #666;
`;

/* ================= PAGE ================= */

const StorePage = () => {
    const { storeId } = useParams();

    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [aisles, setAisles] = useState([]);

    const [selectedAisle, setSelectedAisle] = useState('All');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 40;
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        axios.get(`/api/stores/${storeId}`)
            .then(res => setStore(res.data))
            .catch(console.error);

        axios.get(`/api/products/store/${storeId}/categories`)
            .then(res => setCategories(res.data))
            .catch(console.error);
    }, [storeId]);

    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        fetchProducts(1, true);
    }, [storeId, selectedAisle]);

    const fetchProducts = async (pageToLoad, reset = false) => {
        try {
            if (reset) setLoading(true);
            else setLoadingMore(true);

            const params = {
                page: pageToLoad,
                limit: 40
            };

            if (selectedCategory !== 'All') {
                params.category = selectedCategory;
            }

            const res = await axios.get(`/api/products/store/${storeId}`, { params });

            const newProducts = res.data.products || [];

            setProducts(prev =>
                reset ? newProducts : [...prev, ...newProducts]
            );

            setHasMore(res.data.hasMore);
            setPage(pageToLoad);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (loadingMore || !hasMore) return;

            const nearBottom =
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 600;

            if (nearBottom) {
                fetchProducts(page + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [page, hasMore, loadingMore, selectedAisle]);

    if (loading) return <Loading>Loading store...</Loading>;
    if (!store) return <Center>Store not found</Center>;

    return (
        <Container>
            <Header>
                <StoreInfo>
                    <Logo src={store.logo} alt={store.name} />
                    <StoreText>
                        <StoreTitle>{store.name}</StoreTitle>
                        <Subtitle>{store.description}</Subtitle>
                    </StoreText>
                </StoreInfo>
            </Header>

            <AisleBar>
                <AisleTab
                    active={selectedAisle === 'All'}
                    onClick={() => setSelectedAisle('All')}
                >
                    All
                </AisleTab>

                {categories.map(category => (
                    <AisleTab
                        key={category}
                        active={selectedCategory === category}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </AisleTab>
                ))}
            </AisleBar>

            <SectionHeader>
                <h2>{selectedAisle}</h2>
                <span>{products.length} loaded</span>
            </SectionHeader>

            {products.length === 0 ? (
                <Center>No products in this aisle</Center>
            ) : (
                <Grid>
                    {products.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onAddToCart={() => console.log('Add:', product)}
                        />
                    ))}
                </Grid>
            )}

            {loadingMore && <Loading>Loading more products...</Loading>}
            {!hasMore && products.length > 0 && <Center>End of results</Center>}
        </Container>
    );
};

export default StorePage;