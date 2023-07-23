import React, { useState } from 'react';

import Action from './components/Action';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [token, setToken] = useState('');

  return (
    <div>
      <Register />

      <Login setToken={setToken} />

      <Action token={token} />
    </div>
  );
}

export default App;
