import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bodyParser from 'body-parser';
import {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  searchBooks,
  getBooksByCategory,
  getAllMembers,
  addMember,
  getMemberById,
  borrowBook,
  returnBook,
  getBorrowingHistory,
  getActiveLoans,
  createNotification,
  getNotifications
} from './database.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Get all books
app.get('/api/books', (req, res) => {
  try {
    const books = getAllBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get book by ID
app.get('/api/books/:id', (req, res) => {
  try {
    const book = getBookById(req.params.id);
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search books
app.get('/api/books/search/:query', (req, res) => {
  try {
    const books = searchBooks(req.params.query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get books by category
app.get('/api/books/category/:category', (req, res) => {
  try {
    const books = getBooksByCategory(req.params.category);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new book
app.post('/api/books', (req, res) => {
  try {
    const book = addBook(req.body);
    io.emit('book_added', book);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update book
app.put('/api/books/:id', (req, res) => {
  try {
    const book = updateBook(req.params.id, req.body);
    io.emit('book_updated', { id: req.params.id, ...book });
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete book
app.delete('/api/books/:id', (req, res) => {
  try {
    deleteBook(req.params.id);
    io.emit('book_deleted', { id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== MEMBERS APIs ====================

// Get all members
app.get('/api/members', (req, res) => {
  try {
    const members = getAllMembers();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get member by ID
app.get('/api/members/:id', (req, res) => {
  try {
    const member = getMemberById(req.params.id);
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new member
app.post('/api/members', (req, res) => {
  try {
    const member = addMember(req.body);
    io.emit('member_added', member);
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== BORROWING APIs ====================

// Borrow book
app.post('/api/borrow', (req, res) => {
  try {
    const { bookId, memberId } = req.body;
    const record = borrowBook(bookId, memberId);
    
    const member = getMemberById(memberId);
    const book = getBookById(bookId);
    
    createNotification(memberId, `You borrowed "${book.title}" by ${book.author}`, 'borrow');
    
    io.emit('book_borrowed', { ...record, memberName: member.name, bookTitle: book.title });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return book
app.post('/api/return', (req, res) => {
  try {
    const { recordId, memberId } = req.body;
    const result = returnBook(recordId);
    
    createNotification(memberId, 'Book returned successfully', 'return');
    io.emit('book_returned', result);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get borrowing history
app.get('/api/borrowing-history/:memberId', (req, res) => {
  try {
    const history = getBorrowingHistory(req.params.memberId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active loans
app.get('/api/active-loans', (req, res) => {
  try {
    const loans = getActiveLoans();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NOTIFICATIONS APIs ====================

// Get notifications
app.get('/api/notifications/:memberId', (req, res) => {
  try {
    const notifications = getNotifications(req.params.memberId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SOCKET.IO ====================

io.on('connection', (socket) => {
  console.log('✓ User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('✗ User disconnected:', socket.id);
  });

  socket.on('request_book_update', async () => {
    try {
      const books = await getAllBooks();
      socket.emit('books_updated', books);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Library Management Backend Running on http://localhost:${PORT}`);
  console.log(`📱 WebSocket Server Ready for Real-time Updates\n`);
});
