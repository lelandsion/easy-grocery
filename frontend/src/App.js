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
import SearchResultsPage from './components/pages/SearchResultsPage';
import StorePage from './components/pages/StorePage';
import axios from "api";
import {useEffect} from "react";
import { Toaster } from 'react-hot-toast';


function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const token = localStorage.getItem('token');

        if (!token) {
            setLoading(false);
            return;
        }

        axios.get('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        })

            .then(res => setUser(res.data))
            .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
            })

            .finally(() => setLoading(false));

    }, []);


    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    return (
        <Router>
            <Navbar />
            <Toaster position="bottom-center" />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stores" element={<StoreListPage />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/my-lists" element={<MyLists />} />
                <Route path="/account" element={
                        user
                            ? <AccountPage user={user} setUser={setUser} />
                            : <LoginPage onLoginSuccess={handleLoginSuccess} />
                    }
                />
                <Route path="/login" element={<LoginPage onLoginSuccess={setUser} />}/>
                <Route path="*" element={<div>404 - Page not found</div>} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/stores/:storeId" element={<StorePage />} />
                <Route path="/products/:id" element={<ProductDetailsPage />}
                />
            </Routes>
        </Router>
    );
}

export default App;