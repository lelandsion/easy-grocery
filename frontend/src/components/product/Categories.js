// src/components/pages/Categories.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../product/ProductCard';

const Categories = () => {
    const { category } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            const url = `${process.env.REACT_APP_API_URL}/products?category=${category}`;
            console.log(`Fetching products from: ${url}`);
            try {
                const response = await axios.get(url);
                console.log("Products fetched successfully:", response.data);
                setProducts(response.data);
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category]);

    if (loading) return <p>Loading products...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>{category} Products</h2>
            <div className="product-list">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default Categories;