import React, { useState } from 'react';
import axios from "../../api";
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

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

const Logo = styled.h1`
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;

    span {
        color: #22c55e;
    }
`;

const Title = styled.h2`
    font-size: 18px;
    margin-bottom: 18px;
    font-weight: 600;
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
    font-weight: 500;
    cursor: pointer;

    &:hover {
        background: #16a34a;
    }
`;

const LinkButton = styled.button`
    margin-top: 12px;
    background: none;
    border: none;
    color: #22c55e;
    cursor: pointer;
`;

const Message = styled.p`
    font-size: 13px;
    margin-bottom: 10px;

    color: #991b1b;
    background: #fee2e2;

    padding: 10px 12px;

    border-radius: 10px;

    border: 1px solid #fecaca;
`;

const GoogleBox = styled.div`

    margin-top: 16px;

    display: flex;

    justify-content: center;

`;

const Divider = styled.div`

    display: flex;

    align-items: center;

    gap: 12px;

    margin: 18px 0;

    color: #999;

    font-size: 13px;

    &::before,

    &::after {

        content: "";

        flex: 1;

        height: 1px;

        background: #e5e7eb;

    }

`;

const LoginPage = ({ onLoginSuccess }) => {
    const [signUpData, setSignUpData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState(null);
    const [showSignUp, setShowSignUp] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('/api/auth/login', formData);
            const token = response.data.token;

            localStorage.setItem('token', token);

            const profileResponse = await axios.get('/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            onLoginSuccess(profileResponse.data);
            setMessage(null);
            navigate('/');
        } catch (error) {
            setMessage('Invalid email or password.');
        }
    };

    const SignUpForm = () => {
        const [signUpData, setSignUpData] = useState({
            username: '',
            email: '',
            password: ''
        });
        const [signUpMessage, setSignUpMessage] = useState(null);

        const handleChange = (e) => {
            setSignUpData({ ...signUpData, [e.target.name]: e.target.value });
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const res = await axios.post('/api/auth/register', signUpData);
                localStorage.setItem('token', res.data.token);
                setSignUpMessage("Account created!");
                setShowSignUp(false);
            } catch {
                setSignUpMessage("Error creating account.");
            }
        };

        return (
            <>
                <Title>Create account</Title>

                {signUpMessage && <Message>{signUpMessage}</Message>}

                <form onSubmit={handleSubmit}>
                    <Input name="username" placeholder="Username" onChange={handleChange} required />
                    <Input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                    <Input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit">Sign Up</Button>
                </form>

                <LinkButton onClick={() => setShowSignUp(false)}>
                    Already have an account? Login
                </LinkButton>
            </>
        );
    };

    return (
        <Page>
            <Card>
                <Logo>Grocer<span>AI</span></Logo>

                {showSignUp ? (
                    <SignUpForm />
                ) : (
                    <>
                        <Title>Welcome back</Title>

                        {message && <Message>{message}</Message>}

                        <form onSubmit={handleLoginSubmit}>

                            <Input type="email" name="email" placeholder="Email" onChange={handleChange} required/>

                            <Input type="password" name="password" placeholder="Password" onChange={handleChange}
                                   required/>

                            <Button type="submit">Login</Button>

                        </form>

                        <Divider>or</Divider>

                        <GoogleBox>

                            <GoogleLogin

                                width="316"

                                text="continue_with"

                                shape="pill"

                                onSuccess={async (credentialResponse) => {

                                    try {

                                        const res = await axios.post('/api/auth/google', {

                                            credential: credentialResponse.credential

                                        });

                                        localStorage.setItem('token', res.data.token);

                                        onLoginSuccess?.(res.data.user);

                                        navigate('/my-lists');

                                    } catch (err) {

                                        console.error(err);

                                        setMessage('Google sign-in failed.');

                                    }

                                }}

                                onError={() => {

                                    setMessage('Google sign-in failed.');

                                }}

                            />

                        </GoogleBox>

                        <LinkButton onClick={() => setShowSignUp(true)}>

                            Don't have an account? Sign up

                        </LinkButton>

                    </>
                )}
            </Card>
        </Page>
    );
};

export default LoginPage;