// TODO: remove the categories part and allow for aisles selection for each store

import React from 'react';
import ProductCarousel from '../product/ProductCarousel'; // For featured products or deals
import CategoryList from '../product/Categories'; // For category browsing
import StoreList from '../pages/StoreListPage'; // For available stores
import FavoritePage from '../user/Favorites'; // User favorites
import ListPage from '../user/MyLists'; // User shopping lists


const HomePage = () => (
    <div>
        <h1>Welcome to Easy Grocery</h1>

        <section>
            <h2>Top Deals</h2>
            <ProductCarousel /> {/* Carousel of top deals or recommendations */}
        </section>

      {  <section>
            <h2>Shop by Category</h2>
            <CategoryList />  Display categories like fruits, snacks, beverages
        </section>}

        <section>
            <h2>Popular Stores</h2>
            <StoreList /> {/* List of stores, linking to product lists */}
        </section>

        <section>
            <h2>My Favorites</h2>
            <FavoritePage /> {/* User's favorite items */}
        </section>

        <section>
            <h2>My Shopping Lists</h2>
            <ListPage /> {/* Preview of user-created lists */}
        </section>
    </div>
);

export default HomePage;
