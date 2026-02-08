import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, BookOpen, TrendingUp } from 'lucide-react';
import './Dashboard.css';

function Dashboard({ socket }) {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    activeLoans: 0,
    overdueBooks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    socket.on('book_added', fetchDashboardData);
    socket.on('member_added', fetchDashboardData);
    socket.on('book_borrowed', (data) => {
      addActivity(`${data.memberName} borrowed "${data.bookTitle}"`);
      fetchDashboardData();
    });
    socket.on('book_returned', (data) => {
      addActivity('Book returned successfully');
      fetchDashboardData();
    });

    return () => {
      socket.off('book_added');
      socket.off('member_added');
      socket.off('book_borrowed');
      socket.off('book_returned');
    };
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      const [booksRes, membersRes, loansRes] = await Promise.all([
        axios.get('/api/books'),
        axios.get('/api/members'),
        axios.get('/api/active-loans')
      ]);

      setStats({
        totalBooks: booksRes.data.length,
        totalMembers: membersRes.data.length,
        activeLoans: loansRes.data.length,
        overdueBooks: loansRes.data.filter(loan => new Date(loan.dueDate) < new Date()).length
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const addActivity = (message) => {
    const newActivity = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setRecentActivity(prev => [newActivity, ...prev.slice(0, 9)]);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <h2 className="dashboard-title">Dashboard</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon books-icon">
              <BookOpen size={32} />
            </div>
            <div className="stat-content">
              <h3>Total Books</h3>
              <p className="stat-number">{stats.totalBooks}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon members-icon">
              <Users size={32} />
            </div>
            <div className="stat-content">
              <h3>Members</h3>
              <p className="stat-number">{stats.totalMembers}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon loans-icon">
              <TrendingUp size={32} />
            </div>
            <div className="stat-content">
              <h3>Active Loans</h3>
              <p className="stat-number">{stats.activeLoans}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon overdue-icon">
              <BarChart3 size={32} />
            </div>
            <div className="stat-content">
              <h3>Overdue Books</h3>
              <p className="stat-number" style={{ color: '#ef4444' }}>{stats.overdueBooks}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <h3>📊 Activity Distribution</h3>
            <div className="chart-placeholder">
              <p>Books by Category</p>
              <div style={{ fontSize: '48px', margin: '20px 0' }}>📈</div>
            </div>
          </div>

          <div className="card">
            <h3>🔔 Recent Activity</h3>
            <div className="activity-list">
              {recentActivity.length === 0 ? (
                <p style={{ color: '#9ca3af' }}>No recent activity</p>
              ) : (
                recentActivity.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <span className="activity-message">{activity.message}</span>
                    <span className="activity-time">{activity.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
