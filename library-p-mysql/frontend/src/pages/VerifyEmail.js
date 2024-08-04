import React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
  const { token } = useParams();

  React.useEffect(() => {
    axios.get(`http://localhost:5000/verify/${token}`)
      .then(response => alert('Email verified successfully!'))
      .catch(error => alert('Error verifying email.'));
  }, [token]);

  return <div>Verifying your email...</div>;
}

export default VerifyEmail;
