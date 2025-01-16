
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../product/ProductCard';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const location = useLocation();

    // Extract query parameters (e.g., ?search=apple&category=fruit)
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search'); // For search functionality
    const category = queryParams.get('category');  // For category-based filtering
    const store = queryParams.get('store');        // For store-specific products

    useEffect(() => {
        // Build the API endpoint based on query parameters
        let apiUrl = `${process.env.REACT_APP_API_URL}/products`;

        // Add filters to the API URL
        const filters = [];
        if (searchQuery) filters.push(`search=${searchQuery}`);
        if (category) filters.push(`category=${category}`);
        if (store) filters.push(`store=${store}`);
        if (filters.length) apiUrl += `?${filters.join('&')}`;

        // Fetch filtered products from the backend
        axios.get(apiUrl)
            .then(response => setProducts(response.data))
            .catch(error => console.error('Error fetching products:', error));
    }, [searchQuery, category, store]);

    return (
        <div>
            <h2>Products</h2>
            {searchQuery && <p>Search results for "{searchQuery}"</p>}
            {category && <p>Category: {category}</p>}
            {store && <p>Store: {store}</p>}

            <div className="product-list">
                {products.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductListPage;
