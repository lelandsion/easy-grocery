import React, { useState } from 'react';
import axios from "../../api";
import styled from 'styled-components';

const Page = styled.div`
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f6f7fb;
`;

const Card = styled.div`
    width: 380px;
    background: white;
    padding: 32px;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
`;

const Title = styled.h2`
    font-size: 18px;
    margin-bottom: 18px;
`;

const Input = styled.input`
    width: 100%;
    padding: 12px 14px;
    margin-bottom: 12px;
    border-radius: 10px;
    border: 1px solid #ddd;
    outline: none;

    &:focus {
        border-color: #22c55e;
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 10px;
    background: #22c55e;
    color: white;
    cursor: pointer;

    &:hover {
        background: #16a34a;
    }
`;

const Message = styled.p`
    font-size: 13px;
    margin-bottom: 10px;
    color: #666;
`;

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/auth/register', formData);
            localStorage.setItem('token', res.data.token);
            setMessage("Account created successfully!");
        } catch {
            setMessage("Error during registration.");
        }
    };

    return (
        <Page>
            <Card>
                <Title>Create account</Title>

                {message && <Message>{message}</Message>}

                <form onSubmit={handleSubmit}>
                    <Input name="username" placeholder="Username" onChange={handleChange} required />
                    <Input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                    <Input type="password" name="password" placeholder="Password" onChange={handleChange} required />

                    <Button type="submit">Sign Up</Button>
                </form>
            </Card>
        </Page>
    );
};

export default SignUpPage;