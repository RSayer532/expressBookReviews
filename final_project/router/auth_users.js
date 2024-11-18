const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username" : "user1", "password" : "password1"}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username, password)=>{ 
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    let book = books[req.params.isbn];
    let user = req.session.authorization.username;

    if (book) {
        
        books[req.params.isbn].reviews[user] = req.body.review;

        if (user in book.reviews) {
            res.send("New review added from " + user);
        } else {
            res.send("Updated review from " + user);
        }

    } else {
        res.status(208).json({message : "Invalid ISBN"});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let book = books[isbn];
    let user = req.session.authorization.username;

    if (book) {
        let reviews = book.reviews;
        if (reviews[user]) {
            books[isbn].reviews = Object.entries(reviews).filter( ([username, review]) => username != user);
            res.status(200).json({message: `Successfully deleted review from user ${user}.`});
        } else {
            res.send("User " + user + " has not written a review for this book")
        }
    } else {
        res.send("Book with ISBN " + req.params.isbn + " does not exist in the database");
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
