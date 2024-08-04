import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:5000/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(response.data);
                } catch (error) {
                    setMessage('Error fetching profile data.');
                }
            }
        };

        fetchUserProfile();
    }, []);

    const requestConfirmationEmail = async () => {
        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/request-confirmation', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Confirmation email sent.');
        } catch (error) {
            setMessage('Error sending confirmation email.');
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div className="container mt-5">
            <h2>User Profile</h2>
            <p>Name: {user.first_name} {user.last_name}</p>
            <p>
                Email: {user.email}{' '}
                <span className={`badge ${user.email_verified ? 'badge-success' : 'badge-danger'}`}>
                    {user.email_verified ? 'Confirmed' : 'Unconfirmed'}
                </span>
                {!user.email_verified && (
                    <button className="btn btn-link" onClick={requestConfirmationEmail}>
                        Request Confirmation Email
                    </button>
                )}
            </p>
            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    );
};

export default Profile;
