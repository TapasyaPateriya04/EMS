import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthProvider';

const CreateUser = ({ navigateTo }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useContext(AuthContext);

  const handleCreateUser = () => {
    if (!name || !email || !password) {
      alert('All fields are required!');
      return;
    }

    const newUser = {
      id: userData ? userData.length + 1 : 1,
      firstName: name,
      email,
      password,
      taskCounts: {
        active: 0,
        newTask: 0,
        completed: 0,
        failed: 0,
      },
      tasks: [],
    };

    const updatedUsers = userData ? [...userData, newUser] : [newUser];
    setUserData(updatedUsers);

    // Update localStorage
    const localStorageData = JSON.parse(localStorage.getItem('employees')) || [];
    localStorage.setItem('employees', JSON.stringify([...localStorageData, newUser]));

    alert('User created successfully!');
    navigateTo('login');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-80 bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create New User</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-slate-950 w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="text-slate-950 w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="text-slate-950 w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreateUser}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Create User
        </button>
        <button
          onClick={() => navigateTo('login')}
          className="w-full mt-4 text-blue-500 hover:underline text-center"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default CreateUser;
