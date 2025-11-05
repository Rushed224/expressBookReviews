const express = require('express');
let books = require("./booksdb.js");
const public_users = express.Router();
let users = [];

// Function to check if a username is valid
const isValid = (username) => users.some(user => user.username === username);

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required." });
    if (users.find(user => user.username === username)) return res.status(409).json({ message: "Username already exists." });
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login." });
});

// Task 10: Get all books (async)
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await Promise.resolve(books); // simulate async
        return res.status(200).json(allBooks);
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

// Task 11: Get book by ISBN (async)
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await Promise.resolve(books[isbn]);
        if (book) return res.status(200).json(book);
        else return res.status(404).json({ message: "Book not found" });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

// Task 12: Get books by author (async)
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author.toLowerCase();
    try {
        const matchingBooks = await Promise.resolve(
            Object.values(books).filter(b => b.author.toLowerCase() === author)
        );
        if (matchingBooks.length > 0) return res.status(200).json(matchingBooks);
        else return res.status(404).json({ message: "No books found by this author" });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

// Task 13: Get books by title (async)
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title.toLowerCase();
    try {
        const matchingBooks = await Promise.resolve(
            Object.values(books).filter(b => b.title.toLowerCase() === title)
        );
        if (matchingBooks.length > 0) return res.status(200).json(matchingBooks);
        else return res.status(404).json({ message: "No books found with this title" });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

// Get book reviews
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await Promise.resolve(books[isbn]);
        if (book) return res.status(200).json(book.reviews);
        else return res.status(404).json({ message: "Book not found" });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

module.exports = { general: public_users, users, isValid };
