// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import Login from './Login'; // Pastikan ini diimpor
import Profile from './Profile';
import Register from './Register';
import {Notifikasi} from './Notif';
import DomainList from './DomainList';
import ProfileUser from './ProfileUser';
import ManajementUser from './UserManagement';


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile-user" element={<ProfileUser />} />
                <Route path="/login" element={<Login />} /> {/* Pastikan ini ada */}
                <Route path="/register" element={<Register />} />
                <Route path="/daftar-domain" element={<DomainList />} />
                <Route path="/manajemen-user" element={<ManajementUser />} />
                <Route path="/" element={<Login />} /> 
                {/* <Route path="/" element={<Notifikasi />} />  */}
            </Routes>
        </Router>
    );
};

export default App;
