// src/components/layout/Footer.js
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
    background-color: #333;
    color: white;
    text-align: center;
    padding: 1em 0;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
`;

const FooterText = styled.p`
    margin: 0;
`;

const FooterLinks = styled.div`
    margin-top: 0.5em;
    a {
        color: #d3d3d3;
        margin: 0 0.5em;
        text-decoration: none;
        &:hover {
            color: white;
        }
    }
`;

const Footer = () => (
    <FooterContainer>
        <FooterText>&copy; {new Date().getFullYear()} Easy Grocery</FooterText>
        <FooterLinks>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/contact">Contact Us</a>
        </FooterLinks>
    </FooterContainer>
);

export default Footer;
