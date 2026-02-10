import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, RotateCcw } from 'lucide-react';
import './BorrowReturn.css';

function BorrowReturn({ socket }) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [borrowData, setBorrowData] = useState({
    bookId: '',
    memberId: ''
  });
  const [returnData, setReturnData] = useState({
    recordId: '',
    memberId: ''
  });

  useEffect(() => {
    fetchData();
    
    socket.on('book_borrowed', fetchData);
    socket.on('book_returned', fetchData);

    return () => {
      socket.off('book_borrowed');
      socket.off('book_returned');
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const [booksRes, membersRes, loansRes] = await Promise.all([
        axios.get('/api/books'),
        axios.get('/api/members'),
        axios.get('/api/active-loans')
      ]);
      
      setBooks(booksRes.data);
      setMembers(membersRes.data);
      setActiveLoans(loansRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleBorrowBook = async (e) => {
    e.preventDefault();
    if (!borrowData.bookId || !borrowData.memberId) {
      alert('Please select both a book and a member');
      return;
    }

    try {
      await axios.post('/api/borrow', borrowData);
      setBorrowData({ bookId: '', memberId: '' });
      fetchData();
      alert('Book borrowed successfully!');
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleReturnBook = async (e) => {
    e.preventDefault();
    if (!returnData.recordId || !returnData.memberId) {
      alert('Please select a book to return');
      return;
    }

    try {
      await axios.post('/api/return', returnData);
      setReturnData({ recordId: '', memberId: '' });
      fetchData();
      alert('Book returned successfully!');
    } catch (error) {
      console.error('Error returning book:', error);
      alert('Error: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="borrow-return">
      <div className="container">
        <h2 style={{ color: 'white', marginBottom: '30px' }}>📖 Borrow & Return Books</h2>

        <div className="borrow-return-grid">
          {/* Borrow Section */}
          <div className="card">
            <h3>📤 Borrow Book</h3>
            <form onSubmit={handleBorrowBook}>
              <div className="form-group">
                <label>Select Book *</label>
                <select
                  required
                  value={borrowData.bookId}
                  onChange={(e) => setBorrowData({...borrowData, bookId: e.target.value})}
                >
                  <option value="">Choose a book...</option>
                  {books.map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.author} ({book.availableCopies} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Member *</label>
                <select
                  required
                  value={borrowData.memberId}
                  onChange={(e) => setBorrowData({...borrowData, memberId: e.target.value})}
                >
                  <option value="">Choose a member...</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={20} /> Borrow Book
              </button>
            </form>
          </div>

          {/* Return Section */}
          <div className="card">
            <h3>📥 Return Book</h3>
            <form onSubmit={handleReturnBook}>
              <div className="form-group">
                <label>Select Member *</label>
                <select
                  required
                  value={returnData.memberId}
                  onChange={(e) => {
                    setReturnData({...returnData, memberId: e.target.value});
                    setReturnData({...returnData, recordId: ''});
                  }}
                >
                  <option value="">Choose a member...</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Book to Return *</label>
                <select
                  required
                  value={returnData.recordId}
                  onChange={(e) => setReturnData({...returnData, recordId: e.target.value})}
                >
                  <option value="">Choose a book...</option>
                  {activeLoans
                    .filter(loan => loan.memberId === returnData.memberId)
                    .map(loan => (
                      <option key={loan.id} value={loan.id}>
                        {loan.title} - {loan.author}
                      </option>
                    ))}
                </select>
              </div>

              <button type="submit" className="btn btn-success" style={{ width: '100%' }}>
                <RotateCcw size={20} /> Return Book
              </button>
            </form>
          </div>
        </div>

        {/* Active Loans Table */}
        <div className="card" style={{ marginTop: '30px' }}>
          <div className="loans-header">
            <h3>🔄 Active Loans</h3>
            <div className="loans-filter">
              <button 
                className={`filter-btn ${!showOverdueOnly ? 'active' : ''}`}
                onClick={() => setShowOverdueOnly(false)}
              >
                All Loans ({activeLoans.length})
              </button>
              <button 
                className={`filter-btn ${showOverdueOnly ? 'active' : ''}`}
                onClick={() => setShowOverdueOnly(true)}
              >
                Overdue Only ({activeLoans.filter(loan => new Date(loan.dueDate) < new Date()).length})
              </button>
            </div>
          </div>
          <div className="table-wrapper">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Author</th>
                  <th>Borrowed</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeLoans.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      No active loans
                    </td>
                  </tr>
                ) : (
                  activeLoans
                    .filter(loan => {
                      if (!showOverdueOnly) return true;
                      return new Date(loan.dueDate) < new Date();
                    })
                    .map(loan => {
                      const dueDate = new Date(loan.dueDate);
                      const today = new Date();
                      const isOverdue = dueDate < today;
                      const daysOverdue = isOverdue ? Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)) : 0;

                      return (
                        <tr 
                          key={loan.id}
                          className="clickable-row"
                          onClick={() => setSelectedLoan({...loan, isOverdue, daysOverdue})}
                          title="Click to view details"
                        >
                          <td><strong>{loan.name}</strong></td>
                          <td>{loan.title}</td>
                          <td>{loan.author}</td>
                          <td>{new Date(loan.borrowDate).toLocaleDateString()}</td>
                          <td>{dueDate.toLocaleDateString()}</td>
                          <td>
                            <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-success'}`}>
                              {isOverdue ? `${daysOverdue} days overdue` : 'On Time'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="modal" onClick={() => setSelectedLoan(null)}>
          <div className="modal-content loan-details-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedLoan(null)}
            >
              ✕
            </button>
            <div className="loan-details">
              <div className="detail-header">
                <div className="loan-icon">📚</div>
                <div className="loan-title-section">
                  <h2>{selectedLoan.title}</h2>
                  <p className="loan-author">by {selectedLoan.author}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>📖 Book Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">ISBN:</span>
                    <span className="value">{selectedLoan.isbn || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Category:</span>
                    <span className="value">{selectedLoan.category || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>👤 Member Information</h3>
                <div className="detail-grid">
                  <div className="detail-item full-width">
                    <span className="label">Member Name:</span>
                    <span className="value">{selectedLoan.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedLoan.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{selectedLoan.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>📅 Loan Timeline</h3>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-marker borrowed"></div>
                    <div className="timeline-content">
                      <span className="timeline-label">Borrowed Date</span>
                      <span className="timeline-date">{new Date(selectedLoan.borrowDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className={`timeline-marker ${selectedLoan.isOverdue ? 'overdue' : 'ontime'}`}></div>
                    <div className="timeline-content">
                      <span className="timeline-label">Due Date</span>
                      <span className="timeline-date">{new Date(selectedLoan.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>⚠️ Loan Status</h3>
                {selectedLoan.isOverdue ? (
                  <div className="status-alert danger">
                    <span className="status-icon">⚠️</span>
                    <div>
                      <p className="status-title">This book is OVERDUE</p>
                      <p className="status-message">{selectedLoan.daysOverdue} days overdue (due {new Date(selectedLoan.dueDate).toLocaleDateString()})</p>
                    </div>
                  </div>
                ) : (
                  <div className="status-alert success">
                    <span className="status-icon">✓</span>
                    <div>
                      <p className="status-title">On Track</p>
                      <p className="status-message">Due on {new Date(selectedLoan.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                {selectedLoan.isOverdue && (
                  <button className="btn btn-danger">Send Reminder</button>
                )}
                <button className="btn btn-success">Return Book</button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setSelectedLoan(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BorrowReturn;
