// import React, { useContext, useEffect, useState } from 'react'
// import Login from './components/Auth/Login'
// import EmployeeDashboard from './components/Dashboard/EmployeeDashboard'
// import AdminDashboard from './components/Dashboard/AdminDashboard'
// import { AuthContext } from './context/AuthProvider'

// const App = () => {

//   const [user, setUser] = useState(null)
//   const [loggedInUserData, setLoggedInUserData] = useState(null)
//   const [userData,SetUserData] = useContext(AuthContext)

//   useEffect(()=>{
//     const loggedInUser = localStorage.getItem('loggedInUser')
    
//     if(loggedInUser){
//       const userData = JSON.parse(loggedInUser)
//       setUser(userData.role)
//       setLoggedInUserData(userData.data)
//     }

//   },[])


//   const handleLogin = (email, password) => {
//     if (email == 'admin@me.com' && password == '123') {
//       setUser('admin')
//       localStorage.setItem('loggedInUser', JSON.stringify({ role: 'admin' }))
//     } else if (userData) {
//       const employee = userData.find((e) => email == e.email && e.password == password)
//       if (employee) {
//         setUser('employee')
//         setLoggedInUserData(employee)
//         localStorage.setItem('loggedInUser', JSON.stringify({ role: 'employee',data:employee }))
//       }
//     }
//     else {
//       alert("Invalid Credentials")
//     }
//   }



//   return (
//     <>
//       {!user ? <Login handleLogin={handleLogin} /> : ''}
//       {user == 'admin' ? <AdminDashboard changeUser={setUser} /> : (user == 'employee' ? <EmployeeDashboard changeUser={setUser} data={loggedInUserData} /> : null) }
//     </>
//   )
// }

// export default App


import React, { useContext, useEffect, useState } from 'react';
import Login from './components/Auth/Login';
import CreateUser from './components/Auth/CreateUser';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import { AuthContext } from './context/AuthProvider';

const App = () => {
  const [user, setUser] = useState(null);
  const [loggedInUserData, setLoggedInUserData] = useState(null);
  const [userData] = useContext(AuthContext);
  const [currentPage, setCurrentPage] = useState('login'); // For navigation

  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData.role);
      setLoggedInUserData(userData.data);
    }
  }, []);

  const handleLogin = (email, password) => {
    if (email === 'admin@me.com' && password === '123') {
      setUser('admin');
      localStorage.setItem('loggedInUser', JSON.stringify({ role: 'admin' }));
    } else if (userData) {
      const employee = userData.find((e) => email === e.email && e.password === password);
      if (employee) {
        setUser('employee');
        setLoggedInUserData(employee);
        localStorage.setItem('loggedInUser', JSON.stringify({ role: 'employee', data: employee }));
      } else {
        alert('Invalid Credentials');
      }
    }
  };

  const navigateTo = (page) => setCurrentPage(page);

  return (
    <>
      {!user ? (
        currentPage === 'login' ? (
          <Login handleLogin={handleLogin} navigateTo={navigateTo} />
        ) : (
          <CreateUser navigateTo={navigateTo} />
        )
      ) : user === 'admin' ? (
        <AdminDashboard changeUser={setUser} />
      ) : (
        <EmployeeDashboard changeUser={setUser} data={loggedInUserData} />
      )}
    </>
  );
};

export default App;
