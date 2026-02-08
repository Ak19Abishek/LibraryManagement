import React from 'react';
import { BookOpen, Users, RefreshCw, Bell } from 'lucide-react';
import './Header.css';

function Header({ activeTab, setActiveTab }) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <BookOpen size={32} />
          <h1>📚 Library Manager</h1>
        </div>
        
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab ${activeTab === 'books' ? 'active' : ''}`}
            onClick={() => setActiveTab('books')}
          >
            Books
          </button>
          <button
            className={`nav-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>
          <button
            className={`nav-tab ${activeTab === 'borrow' ? 'active' : ''}`}
            onClick={() => setActiveTab('borrow')}
          >
            Borrow/Return
          </button>
        </nav>

        <div className="header-actions">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="badge-count">3</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
