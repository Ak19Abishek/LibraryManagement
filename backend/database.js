import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const MEMBERS_FILE = path.join(DATA_DIR, 'members.json');
const LOANS_FILE = path.join(DATA_DIR, 'loans.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

// Initialize data directory
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
const initializeFiles = () => {
  if (!fs.existsSync(BOOKS_FILE)) fs.writeFileSync(BOOKS_FILE, JSON.stringify([], null, 2));
  if (!fs.existsSync(MEMBERS_FILE)) fs.writeFileSync(MEMBERS_FILE, JSON.stringify([], null, 2));
  if (!fs.existsSync(LOANS_FILE)) fs.writeFileSync(LOANS_FILE, JSON.stringify([], null, 2));
  if (!fs.existsSync(NOTIFICATIONS_FILE)) fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2));
};

initializeFiles();
console.log('✓ Database files initialized');

// Helper functions
const readFile = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) || [];
  } catch {
    return [];
  }
};

const writeFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Books Functions
export function getAllBooks() {
  return readFile(BOOKS_FILE);
}

export function getBookById(id) {
  const books = readFile(BOOKS_FILE);
  return books.find(b => b.id === id);
}

export function addBook(bookData) {
  const id = uuidv4();
  const books = readFile(BOOKS_FILE);
  const newBook = {
    id,
    ...bookData,
    totalCopies: bookData.totalCopies || 1,
    availableCopies: bookData.totalCopies || 1,
    createdAt: new Date().toISOString()
  };
  books.push(newBook);
  writeFile(BOOKS_FILE, books);
  return newBook;
}

export function updateBook(id, bookData) {
  const books = readFile(BOOKS_FILE);
  const index = books.findIndex(b => b.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], ...bookData };
    writeFile(BOOKS_FILE, books);
    return books[index];
  }
  throw new Error('Book not found');
}

export function deleteBook(id) {
  const books = readFile(BOOKS_FILE);
  const filtered = books.filter(b => b.id !== id);
  writeFile(BOOKS_FILE, filtered);
  return { success: true };
}

export function searchBooks(query) {
  const books = readFile(BOOKS_FILE);
  const lowerQuery = query.toLowerCase();
  return books.filter(b =>
    b.title.toLowerCase().includes(lowerQuery) ||
    b.author.toLowerCase().includes(lowerQuery) ||
    (b.category && b.category.toLowerCase().includes(lowerQuery))
  );
}

export function getBooksByCategory(category) {
  const books = readFile(BOOKS_FILE);
  return books.filter(b => b.category === category);
}

// Members Functions
export function getAllMembers() {
  return readFile(MEMBERS_FILE);
}

export function addMember(memberData) {
  const id = uuidv4();
  const members = readFile(MEMBERS_FILE);
  const newMember = {
    id,
    ...memberData,
    membershipDate: new Date().toISOString(),
    status: 'active'
  };
  members.push(newMember);
  writeFile(MEMBERS_FILE, members);
  return newMember;
}

export function getMemberById(id) {
  const members = readFile(MEMBERS_FILE);
  return members.find(m => m.id === id);
}

// Borrowing Functions
export function borrowBook(bookId, memberId) {
  const recordId = uuidv4();
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  
  const books = readFile(BOOKS_FILE);
  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex !== -1 && books[bookIndex].availableCopies > 0) {
    books[bookIndex].availableCopies--;
    writeFile(BOOKS_FILE, books);
  }
  
  const loans = readFile(LOANS_FILE);
  const newLoan = {
    id: recordId,
    bookId,
    memberId,
    borrowDate: new Date().toISOString(),
    dueDate: dueDate.toISOString(),
    status: 'borrowed'
  };
  loans.push(newLoan);
  writeFile(LOANS_FILE, loans);
  
  return { recordId, bookId, memberId, dueDate };
}

export function returnBook(recordId) {
  const loans = readFile(LOANS_FILE);
  const loanIndex = loans.findIndex(l => l.id === recordId);
  
  if (loanIndex !== -1) {
    const loan = loans[loanIndex];
    loans[loanIndex].status = 'returned';
    loans[loanIndex].returnDate = new Date().toISOString();
    writeFile(LOANS_FILE, loans);
    
    const books = readFile(BOOKS_FILE);
    const bookIndex = books.findIndex(b => b.id === loan.bookId);
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies++;
      writeFile(BOOKS_FILE, books);
    }
    
    return { success: true, recordId };
  }
  throw new Error('Loan record not found');
}

export function getBorrowingHistory(memberId) {
  const loans = readFile(LOANS_FILE);
  const books = readFile(BOOKS_FILE);
  const members = readFile(MEMBERS_FILE);
  
  return loans
    .filter(l => l.memberId === memberId)
    .map(l => {
      const book = books.find(b => b.id === l.bookId);
      const member = members.find(m => m.id === l.memberId);
      return {
        ...l,
        title: book?.title || 'Unknown',
        author: book?.author || 'Unknown',
        name: member?.name || 'Unknown'
      };
    });
}

export function getActiveLoans() {
  const loans = readFile(LOANS_FILE);
  const books = readFile(BOOKS_FILE);
  const members = readFile(MEMBERS_FILE);
  
  return loans
    .filter(l => l.status === 'borrowed')
    .map(l => {
      const book = books.find(b => b.id === l.bookId);
      const member = members.find(m => m.id === l.memberId);
      return {
        ...l,
        title: book?.title || 'Unknown',
        author: book?.author || 'Unknown',
        name: member?.name || 'Unknown',
        email: member?.email || ''
      };
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

// Notifications
export function createNotification(memberId, message, type = 'info') {
  const id = uuidv4();
  const notifications = readFile(NOTIFICATIONS_FILE);
  const newNotification = {
    id,
    memberId,
    message,
    type,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(newNotification);
  writeFile(NOTIFICATIONS_FILE, notifications);
  return newNotification;
}

export function getNotifications(memberId) {
  const notifications = readFile(NOTIFICATIONS_FILE);
  return notifications
    .filter(n => n.memberId === memberId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
