const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
const books = require("./booksdb.js");


// Import the shared users array and isValid function from general.js
let { users, isValid } = require("./general.js");

// Function to check if username/password match a registered user
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "User not logged in" });

    const token = authHeader.split(' ')[1]; // Bearer <token>
    jwt.verify(token, 'access', (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.username = decoded.data; // store username for route
        next();
    });
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in. Username and password required." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      { data: username },
      'access',
      { expiresIn: 60 * 60 }
    );

    return res.status(200).json({ message: "User successfully logged in", token: accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

regd_users.put("/auth/review/:isbn", verifyJWT, (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.username;

    if (!reviewText) return res.status(400).json({ message: "Review text is required." });

    const book = books[isbn];
    if (!book) return res.status(404).json({ message: "Book not found." });

    if (!book.reviews) book.reviews = {};
    book.reviews[username] = reviewText;

    return res.status(200).json({ message: "Review added/updated successfully.", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", verifyJWT, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.username;

    const book = books[isbn];
    if (!book) return res.status(404).json({ message: "Book not found." });

    if (!book.reviews || !book.reviews[username]) return res.status(404).json({ message: "No review by this user to delete." });

    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted successfully.", reviews: book.reviews });
});


module.exports.authenticated = regd_users;
