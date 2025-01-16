import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [message, setMessage] = useState(null);
    const [showSignUp, setShowSignUp] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', formData);
            const token = response.data.token;
            localStorage.setItem('token', token); // Save JWT token

            // Fetch user profile after login
            const profileResponse = await axios.get('/api/user/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            onLoginSuccess(profileResponse.data); // Pass profile data up to parent component
            setMessage("Login successful!");
        } catch (error) {
            setMessage('Invalid email or password.');
        }
    };

    const handleToggleSignUp = () => {
        setShowSignUp(!showSignUp);
    };

    return (
        <div>
            {showSignUp ? (
                <SignUpForm onSignUpSuccess={() => setShowSignUp(false)} />
            ) : (
                <>
                    <h2>Login</h2>
                    {message && <p>{message}</p>}
                    <form onSubmit={handleSubmit}>
                        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                        <button type="submit">Login</button>
                    </form>
                    <p>
                        Don't have an account?{' '}
                        <button onClick={handleToggleSignUp} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>
                            Sign Up
                        </button>
                    </p>
                </>
            )}
        </div>
    );
};

const SignUpForm = ({ onSignUpSuccess }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/register', formData);
            localStorage.setItem('token', response.data.token); // Save JWT token
            setMessage("Sign-up successful! You're now logged in.");
            onSignUpSuccess();
        } catch (error) {
            setMessage('Error during registration.');
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            {message && <p>{message}</p>}
            <form onSubmit={handleSubmit}>
                <input name="username" placeholder="Username" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Sign Up</button>
            </form>
            <p>
                Already have an account?{' '}
                <button onClick={onSignUpSuccess} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Login
                </button>
            </p>
        </div>
    );
};

export default LoginPage;