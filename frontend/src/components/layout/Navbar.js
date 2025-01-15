// src/components/layout/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NavbarContainer = styled.nav`
    background-color: #007bff;
    padding: 1em;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Logo = styled(Link)`
    color: white;
    font-size: 1.5em;
    text-decoration: none;
`;

const NavLinks = styled.div`
    display: flex;
    gap: 1em;
`;

const NavLink = styled(Link)`
    color: white;
    text-decoration: none;
    font-size: 1em;

    &:hover {
        color: #d3d3d3;
    }
`;
// add categories maybe <NavLink to="/categories">Categories</NavLink>
const Navbar = () => (
    <NavbarContainer>
        <Logo to="/">Easy Grocery</Logo>
        <NavLinks>
            <NavLink to="/stores">Stores</NavLink>
            <NavLink to="/favorites">Favorites</NavLink>
            <NavLink to="/my-lists">My Lists</NavLink>
            <NavLink to="/account">Account</NavLink>
        </NavLinks>
    </NavbarContainer>
);

export default Navbar;
