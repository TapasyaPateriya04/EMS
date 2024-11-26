import React, { useState } from 'react';

const Login = ({ handleLogin, navigateTo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    handleLogin(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-80 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Employee Login</h1>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-slate-900 w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-slate-900 w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          className="text-slate-900 w-full bg-blue-500 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigateTo('createUser')}
          className="w-full mt-4 text-blue-500 hover:underline text-center"
        >
          Create New User
        </button>
        <div className=" mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-950">
            <strong className='text-gray-700'>Test Credentials:</strong>
          </p>
          <ul className="text-sm text-gray-900">
            <li className='text-gray-700'>
              <strong className='text-gray-700'>Admin:</strong> <em className='text-gray-700'>email:</em> admin@me.com, <em className='text-gray-700'>password:</em> 123
            </li>
            <li className='text-gray-700'>
              <strong className='text-gray-700'>Employee:</strong> <em className='text-gray-700'>email:</em> e@e.com, <em className='text-gray-700'>password:</em> 123
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
