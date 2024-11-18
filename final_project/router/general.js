const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Simulate an asynchronous operation (e.g., fetching books from a database)
const getBooksFromDatabase = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let bookList = books;

      resolve(bookList); // Simulate a successful DB call with resolved books
    }, 2000); // Simulate 1 second delay (e.g., DB call delay)
  });
};

const getBookFromISBN = async(isbn) => {
    return new Promise( (resolve, reject) => {
        setTimeout(() => {
            let book = books[isbn];
            resolve(book);
        }, 2000);
    });
};

const getBooksFromAuthor = async (author) => {
    return new Promise ( (resolve, reject) => {
        setTimeout( () => {
            let authoredBooks = [];
            Object.entries(books).forEach(([_, book]) => {
                if (book.author === author) {
                    authoredBooks.push({"Title" : book.title, "Reviews" : book.reviews});
                }
            });

            resolve(authoredBooks);
        }, 2000);
    })
}

const getBooksFromTitle = async (title) => {
    return new Promise ( (resolve, reject) => {
        setTimeout( () => {
            let titledBooks = [];
            Object.entries(books).forEach( ([_, book]) => {
                if (book.title === title) {
                    titledBooks.push({"Author" : book.author, "Reviews" : book.reviews});
                };
            });

            resolve(titledBooks);
        }, 2000);
    })
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});

});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {

    try {
        // Simulated call to database in promise getBooksFromDatabase, returning list variable books
        const bookList = await getBooksFromDatabase();
        res.send(JSON.stringify(bookList, null, 4));
    } catch(e) {
        console.error(e);
        res.status(500).json({message: "Unable to fetch book list"});
    }
          
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {

    try {
        const isbn = req.params.isbn;
        // Function returning promise to simulating fetch from the database
        const book = await getBookFromISBN(isbn);

        if (book) {
            res.send(JSON.stringify(books[isbn], null, 4));
        } else {
            res.send(`Book ISBN ${isbn} is not valid`);
        }
    } catch(e) {
        console.error(e);
        res.status(500).json({message: `Unable to fetch book with ISBN ${isbn}`});
    }
 });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {

    try {
        const author = req.params.author;
        // Function returning promise to simulating fetch from the database
        const authoredBooks = await getBooksFromAuthor(author);

        if (authoredBooks.length < 0) {
            res.send("Books under author " + author + " not in database");
        } else {
            res.send(JSON.stringify(authoredBooks, null, 2));
        }
    } catch {
        console.error(e);
        res.status(500).json({message: `Unable to fetch books by ${author} from the database`});
    }   

});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    
    try {
        let title = req.params.title;
        let titledBooks = await getBooksFromTitle(title);

        if (titledBooks.length < 0) {
            res.send("Books under title " + title + " not in the database" );
        } else {
            res.send(JSON.stringify(titledBooks, null, 2));
        }
    } catch {
        console.error(e);
        res.status(500).json({message: `Unable to fetch books of ${title} from the database`});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let bookISBN = req.params.isbn;
    if (bookISBN) {
        res.send(JSON.stringify(books[bookISBN].reviews, null, 2));
    } else {
        res.send("Book with ISBN " + bookISBN + " not in the database");
    }
});

module.exports.general = public_users;
