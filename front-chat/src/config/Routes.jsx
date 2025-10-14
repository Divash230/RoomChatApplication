import React from 'react'
import { Routes, Route } from 'react-router'
import App from '../App';
import ChatPage from '../components/ChatPage';
const AppRoutes = () => {
  return (

    <Routes>
        <Route path="/" element={<App />} />
        <Route path="/chat" element={<h1><ChatPage/></h1>} />
        <Route path="/about"element={<h1>This is about page</h1>} />
        <Route path="*" elements={<h1>404 Page Not Found</h1>} />
    </Routes>
  );
  
  
};

export default AppRoutes;