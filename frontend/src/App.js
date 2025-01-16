// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import ProductListPage from './components/product/ProductListPage';
import ProductDetailsPage from './components/product/ProductDetailsPage';
import CartPage from './components/pages/CartPage';
import Navbar from './components/layout/Navbar';
import Categories from './components/product/Categories';
import Favorites from './components/user/Favorites';
import MyLists from './components/user/MyLists';
import StoreListPage from './components/pages/StoreListPage';
import AccountPage from './components/user/AccountPage';
import LoginPage from './components/user/LoginPage';

function App() {
    const [user, setUser] = useState(null);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stores" element={<StoreListPage />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/my-lists" element={<MyLists />} />
                <Route path="/account" element={user ? <AccountPage user={user} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
            </Routes>
        </Router>
    );
}

export default App;