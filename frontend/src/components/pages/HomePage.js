import React, { useEffect, useState } from 'react';
import ProductCarousel from '../product/ProductCarousel'; // For featured products or deals
import StoreList from '../pages/StoreListPage'; // For available stores
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`

    padding: 24px;

    max-width: 1200px;

    margin: 0 auto;

`;

const Hero = styled.div`
    background: radial-gradient(circle at top right, rgba(255,255,255,0.26), transparent 30%),
                linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    padding: 32px;
    border-radius: 22px;
    margin-bottom: 32px;
    box-shadow: 0 18px 42px rgba(22, 163, 74, 0.18);

    @media (max-width: 768px) {
        padding: 22px;
    }
`;

const HeroTitle = styled.h1`
    font-size: 42px;
    line-height: 1.08;
    letter-spacing: -1.1px;
    margin-bottom: 14px;
    color: white;

    @media (max-width: 768px) {
        font-size: 34px;
    }
`;

const HeroExplanation = styled.p`
    margin-top: 14px;
    max-width: 700px;
    font-size: 17px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.92);
`;

const HeroBadge = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.22);
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 16px;
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

const SecondaryHeroButton = styled.button`
    padding: 13px 20px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.12);
    color: white;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
        background: rgba(255,255,255,0.18);
    }
`;

const HeroActions = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;

    @media (max-width: 768px) {
        width: 100%;

        ${HeroButton},
        ${SecondaryHeroButton} {
            width: 100%;
        }
    }
`;

const SmallDisclaimer = styled.div`
    margin-top: 12px;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
`;

const Footer = styled.footer`
    margin-top: 48px;
    padding: 24px 0;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 13px;
    text-align: center;
    line-height: 1.6;
`;

const HomePage = () => {
    const navigate = useNavigate();
    const [showDeals, setShowDeals] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowDeals(true);
        }, 700);

        return () => clearTimeout(timer);
    }, []);
    return (

        <Container>

            {/* HERO */}

            <Hero>

                <HeroContent>

                    <HeroText>
                        <HeroBadge>Smart grocery shopping</HeroBadge>

                        <HeroTitle>
                            Compare grocery prices before you shop.
                        </HeroTitle>

                        <HeroExplanation>
                            Build smarter grocery lists, compare prices across stores, find deals,
                            and estimate whether one store or a split shopping trip could save you money.
                        </HeroExplanation>
                    </HeroText>

                    <HeroActions>
                        <HeroButton
                            onClick={() => navigate(token ? '/my-lists' : '/account')}
                        >
                            {token ? 'View Your Lists' : 'Create Your First List'}
                        </HeroButton>

                    </HeroActions>

                </HeroContent>

            </Hero>

            {/* Removed DisclaimerNote */}

            {/* TOP DEALS */}
            <Section>
                <TitleRow>
                    <Title>Top Deals</Title>
                </TitleRow>
                {showDeals ? (
                    <ProductCarousel title="Top Deals" />
                ) : (
                    <CardSection>Loading deals...</CardSection>
                )}
                <SmallDisclaimer>
                    Prices and savings are estimates based on available product data and may vary at checkout.
                </SmallDisclaimer>
            </Section>

            {/* STORES */}

            <Section>

                <CardSection>

                    <TitleRow>

                        <Title>Popular Stores</Title>

                    </TitleRow>

                    <StoreList showTitle={false} compact />

                </CardSection>

            </Section>
            <Footer>

                <div>

                    © 2026 BasketWise. Created by Leland Sion. All rights reserved.

                </div>

            </Footer>

        </Container>



    );

};

export default HomePage;
