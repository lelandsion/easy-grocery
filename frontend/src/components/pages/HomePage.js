// TODO: remove the categories part and allow for aisles selection for each store

import React from 'react';
import ProductCarousel from '../product/ProductCarousel'; // For featured products or deals
import CategoryList from '../product/Categories'; // For category browsing
import StoreList from '../pages/StoreListPage'; // For available stores
import FavoritePage from '../user/Favorites'; // User favorites
import ListPage from '../user/MyLists'; // User shopping lists
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`

    padding: 24px;

    max-width: 1200px;

    margin: 0 auto;

`;

const Hero = styled.div`

    background: linear-gradient(135deg, #22c55e, #16a34a);

    color: white;

    padding: 40px 24px;

    border-radius: 16px;

    margin-bottom: 32px;

`;

const HeroTitle = styled.h1`

    font-size: 32px;

    margin-bottom: 10px;

`;

const HeroSubtitle = styled.p`

  font-size: 16px;

  opacity: 0.9;

`;


const Section = styled.section`

  margin-bottom: 48px;

`;

const TitleRow = styled.div`

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 16px;

`;

const Title = styled.h2`

  font-size: 20px;

  font-weight: 600;

`;

const CardSection = styled.div`

  background: white;

  padding: 20px;

  border-radius: 16px;

  border: 1px solid #eee;

`;

const HeroContent = styled.div`

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 24px;

    @media (max-width: 768px) {

        flex-direction: column;

        align-items: flex-start;

    }

`;

const HeroText = styled.div`

    flex: 1;

`;

const HeroButton = styled.button`

    padding: 14px 20px;

    border-radius: 999px;

    border: none;

    background: white;

    color: #16a34a;

    font-weight: 700;

    cursor: pointer;

    white-space: nowrap;

    &:hover {

        opacity: 0.92;

    }

`;

const HomePage = () => {
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    return (

        <Container>

            {/* HERO */}

            <Hero>

                <HeroContent>

                    <HeroText>

                        <HeroTitle>

                            Find the Best Grocery Deals

                        </HeroTitle>

                        <HeroSubtitle>

                            Compare prices across stores and save money instantly

                        </HeroSubtitle>

                    </HeroText>

                    <HeroButton

                        onClick={() => navigate(token ? '/my-lists' : '/account')}

                    >

                        {token

                            ? 'View Your Lists'

                            : 'Sign In & Create Your First List'}

                    </HeroButton>

                </HeroContent>

            </Hero>

            {/* TOP DEALS */}

            <Section>

                <TitleRow>

                    <Title>Top Deals</Title>

                </TitleRow>


                <ProductCarousel title="Top Deals" />
            </Section>

            {/* STORES */}

            <Section>

                <CardSection>

                    <TitleRow>

                        <Title>Popular Stores</Title>

                    </TitleRow>

                    <StoreList />

                </CardSection>

            </Section>

        </Container>

    );

};

export default HomePage;
