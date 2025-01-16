import React, { useState } from 'react';
import axios from 'axios';

const SignUpPage = () => {
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
        </div>
    );
};

export default SignUpPage;