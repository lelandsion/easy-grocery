// src/components/product/ProductCard.js
import React from 'react';

const ProductCard = ({ product, onAddToCart }) => (
    <div className="product-card">
        <img src={product.image_url} alt={product.name} />
        <h3>{product.name}</h3>
        <p>${product.price}</p>
        <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
);

export default ProductCard;
