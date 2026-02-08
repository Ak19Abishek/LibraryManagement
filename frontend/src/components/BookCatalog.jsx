import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import './BookCatalog.css';

function BookCatalog({ socket }) {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Fiction',
    publishYear: new Date().getFullYear(),
    totalCopies: 1,
    description: '',
    coverImage: '📖'
  });

  useEffect(() => {
    fetchBooks();
    
    socket.on('book_added', fetchBooks);
    socket.on('book_updated', fetchBooks);
    socket.on('book_deleted', fetchBooks);

    return () => {
      socket.off('book_added');
      socket.off('book_updated');
      socket.off('book_deleted');
    };
  }, [socket]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('/api/books');
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/books', formData);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: 'Fiction',
        publishYear: new Date().getFullYear(),
        totalCopies: 1,
        description: '',
        coverImage: '📖'
      });
      setShowAddModal(false);
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error adding book: ' + error.response?.data?.error);
    }
  };

  const handleDeleteBook = async (id) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`/api/books/${id}`);
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="book-catalog">
      <div className="container">
        <div className="catalog-header">
          <h2>📚 Book Catalog</h2>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add New Book
          </button>
        </div>

        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="books-grid">
          {filteredBooks.length === 0 ? (
            <p className="no-data">No books found. Start by adding a new book!</p>
          ) : (
            filteredBooks.map(book => (
              <div key={book.id} className="book-card">
                <div className="book-cover">{book.coverImage}</div>
                <h3>{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <p className="book-category">{book.category}</p>
                <div className="book-info">
                  <span className="book-year">{book.publishYear}</span>
                  <span className={`book-stock ${book.availableCopies > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {book.availableCopies}/{book.totalCopies}
                  </span>
                </div>
                <div className="book-actions">
                  <button className="btn-icon btn-secondary" title="Edit">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="btn-icon btn-danger" 
                    title="Delete"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showAddModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Add New Book</h3>
              <form onSubmit={handleAddBook}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Author *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Fiction</option>
                      <option>Non-Fiction</option>
                      <option>Science</option>
                      <option>History</option>
                      <option>Biography</option>
                      <option>Self-Help</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Publish Year</label>
                    <input
                      type="number"
                      value={formData.publishYear}
                      onChange={(e) => setFormData({...formData, publishYear: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({...formData, totalCopies: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Add Book</button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{background: '#e5e7eb', color: '#1f2937'}}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCatalog;
