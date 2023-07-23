import React from 'react';
import axios from 'axios';

function Action({ token }) {
  const handleAction = async () => {
    try {
      console.log('token: ', token);
      const response = await axios.get('/protected', { headers: { Authorization: `Bearer ${token}` } });
      console.log(response.data);
    } catch (error) {
      console.error(error.response);
    }
  };
  
  return (
    <div>
      <h1>Test Protected Action</h1>
      <button onClick={handleAction}>Action</button>
    </div>
  )
}

export default Action;
