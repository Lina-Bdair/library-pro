import React, { useState } from 'react';
import { loginUser } from '../api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await loginUser({ email, password });
            localStorage.setItem('token', response.data.token);
            setMessage('Login successful!');
            navigate('/profile');
        } catch (error) {
            setMessage(error.response.data.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <div className="form-group">
                <input
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="form-group">
                <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handleLogin}>Login</button>
            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    );
};

export default Login;
