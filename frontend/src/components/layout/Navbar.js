import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(229, 231, 235, 0.9);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
    width: 100%;
`;

const TopBar = styled.div`
    display: flex;
    align-items: center;
    padding: 14px 28px;
    gap: 18px;
    width: 100%;
    box-sizing: border-box;
`;

const Logo = styled(Link)`
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.7px;
    text-decoration: none;
    color: #111827;
    white-space: nowrap;
    transition: transform 0.15s ease;

    span {
        color: #22c55e;
    }

    &:hover {
        transform: translateY(-1px);
    }
`;

/* 🔥 Wrap input + button */
const SearchContainer = styled.div`
    flex: 1;
    display: flex;
    margin: 0 12px;
    border-radius: 999px;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
`;

const SearchBar = styled.input`
    flex: 1;
    padding: 12px 16px;
    border-radius: 999px 0 0 999px;
    border: 1px solid #e5e7eb;
    border-right: none;
    font-size: 14px;
    outline: none;

    &:focus {
        border-color: #22c55e;
        box-shadow: inset 0 0 0 1px #22c55e;
    }
`;

const SearchButton = styled.button`
    padding: 0 18px;
    border: 1px solid #22c55e;
    background: #22c55e;
    color: white;
    border-radius: 0 999px 999px 0;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.15s ease;

    &:hover {
        background: #16a34a;
        transform: translateY(-1px);
    }
`;

const RightMenu = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
`;

const MenuLink = styled(Link)`
    text-decoration: none;
    color: #374151;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.15s ease;
    white-space: nowrap;

    &:hover {
        color: #16a34a;
        transform: translateY(-1px);
    }
`;

const BottomBar = styled.div`
  display: flex;
  gap: 10px;
  padding: 10px 28px 12px;
  overflow-x: auto;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  width: 100%;
  box-sizing: border-box;
`;

const Category = styled(Link)`
  text-decoration: none;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 999px;
  background: white;
  border: 1px solid #e5e7eb;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 7px;

  &:hover {
    color: #16a34a;
    border-color: #bbf7d0;
    background: #f0fdf4;
    transform: translateY(-1px);
  }
`;

const CategoryLogo = styled.img`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  object-fit: contain;
  background: white;
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
                <Logo to="/">Basket<span>Wise</span></Logo>

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
                <Category to="/stores/6732efc8132efbd2898fdc6c">
                    <CategoryLogo src="/walmart-logo.svg" alt="Walmart" />
                    Walmart
                </Category>
                <Category to="/stores/6732efc8132efbd2898fdc6d">
                    <CategoryLogo src="/costco-logo.png" alt="Costco" />
                    Costco
                </Category>
                <Category to="/stores/6732efc8132efbd2898fdc70">
                    <CategoryLogo src="/iga-logo.png" alt="IGA" />
                    IGA
                </Category>
                <Category to="/stores/6732efc8132efbd2898fdc6e">
                    <CategoryLogo src="/whole-foods-market-logo.png" alt="Whole Foods" />
                    Whole Foods
                </Category>
                <Category to="/stores/6732efc8132efbd2898fdc6f">
                    <CategoryLogo src="/loblaws-logo.png" alt="Loblaws" />
                    Loblaws
                </Category>
            </BottomBar>
        </Wrapper>
    );
};

export default Navbar;