import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
    position: sticky;
    top: 0;
    z-index: 1000;
    background: white;
    border-bottom: 1px solid #eee;
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 24px;
`;

const Logo = styled(Link)`
    font-size: 22px;
    font-weight: 600;
    text-decoration: none;
    color: #111;

    span {
        color: #22c55e;
    }
`;

/* 🔥 Wrap input + button */
const SearchContainer = styled.div`
    flex: 1;
    display: flex;
    margin: 0 24px;
`;

const SearchBar = styled.input`
    flex: 1;
    padding: 12px 16px;
    border-radius: 999px 0 0 999px;
    border: 1px solid #ddd;
    border-right: none;
    font-size: 14px;
    outline: none;

    &:focus {
        border-color: #22c55e;
    }
`;

const SearchButton = styled.button`
    padding: 0 16px;
    border: 1px solid #22c55e;
    background: #22c55e;
    color: white;
    border-radius: 0 999px 999px 0;
    cursor: pointer;

    &:hover {
        background: #16a34a;
    }
`;

const RightMenu = styled.div`
    display: flex;
    gap: 16px;
`;

const MenuLink = styled(Link)`
    text-decoration: none;
    color: #333;
    font-size: 14px;

    &:hover {
        color: #22c55e;
    }
`;

const BottomBar = styled.div`
  display: flex;
  gap: 20px;
  padding: 10px 24px;
  overflow-x: auto;
  background: #fafafa;
`;

const Category = styled(Link)`
  text-decoration: none;
  color: #444;
  font-size: 14px;
  white-space: nowrap;

  &:hover {
    color: #22c55e;
  }
`;

const Navbar = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    // 🔥 ONE shared function
    const handleSearch = () => {
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    return (
        <Wrapper>
            <TopBar>
                <Logo to="/">Grocer<span>AI</span></Logo>

                <SearchContainer>
                    <SearchBar
                        placeholder="Search for products, stores..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />

                    <SearchButton onClick={handleSearch}>
                        Search
                    </SearchButton>
                </SearchContainer>

                <RightMenu>
                    <MenuLink to="/stores">Stores</MenuLink>
                    <MenuLink to="/favorites">Favorites</MenuLink>
                    <MenuLink to="/my-lists">My Lists</MenuLink>
                    <MenuLink to="/account">Account</MenuLink>
                </RightMenu>
            </TopBar>

            <BottomBar>
                <Category to="/stores/6732efc8132efbd2898fdc6c">Walmart</Category>
                <Category to="/stores/6732efc8132efbd2898fdc6d">Costco</Category>
                <Category to="/stores/6732efc8132efbd2898fdc70">IGA</Category>
                <Category to="/stores/6732efc8132efbd2898fdc6e">Whole Foods</Category>
                <Category to="/stores/6732efc8132efbd2898fdc6f">Loblaws</Category>
            </BottomBar>
        </Wrapper>
    );
};

export default Navbar;