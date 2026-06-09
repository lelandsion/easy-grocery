// TODO: remove the categories part and allow for aisles selection for each store

import React from 'react';
import ProductCarousel from '../product/ProductCarousel';
import StoreList from '../pages/StoreListPage';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
`;

const Hero = styled.div`
    position: relative;
    overflow: hidden;
    background: radial-gradient(circle at top right, rgba(255,255,255,0.25), transparent 28%),
    linear-gradient(135deg, #22c55e, #15803d);
    color: white;
    padding: 48px 32px;
    border-radius: 24px;
    margin-bottom: 32px;
    box-shadow: 0 18px 45px rgba(21, 128, 61, 0.22);

    @media (max-width: 768px) {
        padding: 36px 22px;
    }
`;

const HeroContent = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 32px;
    position: relative;
    z-index: 1;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const HeroText = styled.div`
    flex: 1;
    max-width: 720px;
`;

const Eyebrow = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.22);
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 16px;
`;

const HeroTitle = styled.h1`
    font-size: 42px;
    line-height: 1.08;
    letter-spacing: -1.2px;
    margin-bottom: 14px;

    @media (max-width: 768px) {
        font-size: 34px;
    }
`;

const HeroSubtitle = styled.p`
    font-size: 18px;
    line-height: 1.55;
    opacity: 0.95;
    max-width: 650px;
    margin-bottom: 18px;
`;

const HeroPills = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
`;

const HeroPill = styled.div`
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.16);
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 13px;
    font-weight: 600;
`;

const HeroActions = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 230px;

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const HeroButton = styled.button`
    padding: 14px 20px;
    border-radius: 999px;
    border: none;
    background: white;
    color: #15803d;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;
    font-size: 14px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
    transition: all 0.15s ease;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const SecondaryButton = styled.button`
    padding: 13px 20px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.12);
    color: white;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    font-size: 14px;
    transition: all 0.15s ease;

    &:hover {
        background: rgba(255,255,255,0.18);
        transform: translateY(-1px);
    }

    @media (max-width: 768px) {
        width: 100%;
    }
`;

const Section = styled.section`
    margin-bottom: 48px;
`;

const TitleRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 16px;
`;

const TitleGroup = styled.div``;

const Title = styled.h2`
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.3px;
`;

const SectionSubtitle = styled.p`
    margin-top: 6px;
    color: #6b7280;
    font-size: 14px;
`;

const CardSection = styled.div`
    background: white;
    padding: 20px;
    border-radius: 18px;
    border: 1px solid #eee;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
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
    const token = localStorage.getItem('token');

    return (
        <Container>
            <Hero>
                <HeroContent>
                    <HeroText>
                        <Eyebrow>Smart grocery shopping</Eyebrow>

                        <HeroTitle>
                            Compare grocery prices before you shop.
                        </HeroTitle>

                        <HeroSubtitle>
                            BasketWise helps you build grocery lists, compare prices across stores,
                            find deals, and estimate whether one store or a split shopping trip could
                            save you money.
                        </HeroSubtitle>

                        <HeroPills>
                            <HeroPill>Compare stores</HeroPill>
                            <HeroPill>Build lists</HeroPill>
                            <HeroPill>Find deals</HeroPill>
                            <HeroPill>Estimate savings</HeroPill>
                        </HeroPills>
                    </HeroText>

                    <HeroActions>
                        <HeroButton
                            onClick={() => navigate(token ? '/my-lists' : '/account')}
                        >
                            {token ? 'View Your Lists' : 'Create Your First List'}
                        </HeroButton>

                        <SecondaryButton onClick={() => navigate('/products')}>
                            Browse Products
                        </SecondaryButton>
                    </HeroActions>
                </HeroContent>
            </Hero>

            <Section>
                <TitleRow>
                    <TitleGroup>
                        <Title>Top Deals</Title>
                        <SectionSubtitle>
                            Browse products that appear cheaper than similar items in the current data.
                        </SectionSubtitle>
                    </TitleGroup>
                </TitleRow>

                <ProductCarousel title="Top Deals" />
            </Section>

            <Section>
                <CardSection>
                    <TitleRow>
                        <TitleGroup>
                            <Title>Popular Stores</Title>
                            <SectionSubtitle>
                                Compare available grocery products by store.
                            </SectionSubtitle>
                        </TitleGroup>
                    </TitleRow>

                    <StoreList />
                </CardSection>
            </Section>

            <Footer>
                <div>
                    © 2026 BasketWise. Created by Leland Sion. All rights reserved.
                </div>
                <div>
                    Prices and savings are estimates based on available product data. Final prices,
                    availability, taxes, fees, and product details may vary by retailer.
                </div>
            </Footer>
        </Container>
    );
};

export default HomePage;