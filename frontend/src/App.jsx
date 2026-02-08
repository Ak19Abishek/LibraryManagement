import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import BookCatalog from './components/BookCatalog';
import MemberManagement from './components/MemberManagement';
import BorrowReturn from './components/BorrowReturn';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✓ Connected to WebSocket Server');
    });

    return () => {
      socket.off('connect');
    };
  }, []);

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'dashboard' && <Dashboard socket={socket} />}
        {activeTab === 'books' && <BookCatalog socket={socket} />}
        {activeTab === 'members' && <MemberManagement socket={socket} />}
        {activeTab === 'borrow' && <BorrowReturn socket={socket} />}
      </main>
    </div>
  );
}

export default App;
