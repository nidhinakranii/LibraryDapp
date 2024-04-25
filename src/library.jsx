import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./library.css";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Divider,
  Button,
  Rating,
} from "@mui/material";
import MetaMaskLogo from "../src/assets/metamask.png";
import book1 from "../src/assets/book.jpg";
import { contractAddress, contractABI } from "../src/constant";
const { ethereum } = window;

function Library() {
  const [availableBooks, setAvailableBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [account, setAccount] = useState("");
  const [value, setValue] = useState(0);
  const [bookId, setBookId] = useState("");
  const [copies, setCopies] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publisher, setPublisher] = useState("");
  const [addcopies, setAddcopies] = useState(0);
  const [metaMaskConnected, setMetaMaskConnected] = useState(false); 

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!window.ethereum) {
          console.error("MetaMask extension not detected");
          return;
        }

        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts.length === 0) {
          console.error("Please connect your MetaMask account");
          return;
        }
        
        const books = await contract.getAvailableBooks();
        setAvailableBooks(books);

        const borrowedBookTitles = await contract.getBorrowedBookTitles();
        setBorrowedBooks(borrowedBookTitles);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();

    window.ethereum.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
    });
  }, []);

  const connectMetaMask = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccount(accounts[0]);
      setMetaMaskConnected(true); 
      console.log("MetaMask connected. Connected account:", accounts[0]);
    } catch (error) {
      console.error("Error connecting MetaMask:", error);
    }
  };

  const handleBorrow = async (bookID) => {
    try {
      await contract.borrowBook(bookID, 1);
      console.log(`Book with ID ${bookID} borrowed successfully.`);
    } catch (error) {
      console.error("Error borrowing book:", error);
    }
  };

  const handleReturn = async (bookID) => {
    try {
      await contract.returnBook(bookID, 1);
      console.log(`Book with ID ${bookID} returned successfully.`);
    } catch (error) {
      console.error("Error reducing copies:", error);
    }
  };

  const handleRenew = async (bookID) => {
    try {
      await contract.renewBook(bookID);
      console.log(`Book with ID ${bookID} renewed successfully.`);
    } catch (error) {
      console.error("Error reducing copies:", error);
    }
  };

  const handleReduceCopies = async () => {
    try {
      await contract.reduceCopies(parseInt(bookId), parseInt(copies));
      console.log(`Copies of Book with ID ${bookId} reduced successfully.`);
    } catch (error) {
      console.error("Error reducing copies:", error);
    }
  };

  const handleRemoveBook = async () => {
    try {
      await contract.removeBook(parseInt(bookId));
      console.log(`Book with ID ${bookId} removed successfully.`);
    } catch (error) {
      console.error("Error reducing copies:", error);
    }
  };

  const handleRatingChange = async (bookId, rating) => {
    try {
      await contract.addReview(parseInt(bookId), parseInt(rating));
      console.log(`Rating (${rating}) added for Book with ID ${bookId}.`);
    } catch (error) {
      console.error("Error reducing copies:", error);
    }
  };

  const handleAddBook = async () => {
    try {
      await contract.addBook(title, author, publisher, parseInt(addcopies));
      console.log(`Book "${title}" added successfully.`);
    } catch (error) {
      console.error("Error reducing copies:", error);
    }
  };

  return (
    <div className="library-container">
      <h1 className="">Library Management Project</h1>
      <div className="network-error">
        <p>Please connect to Sepolia network</p>
      </div>
      <div className="metaMask-container">
        {account ? (
          <div>
            <p>{account}</p>
          </div>
        ) : (
          <Button variant="contained" color="primary" onClick={connectMetaMask}>
            <img
              src={MetaMaskLogo}
              alt="MetaMask Logo"
              className="metamask-logo"
            />
            Connect MetaMask
          </Button>
        )}
      </div>{" "}
      <Divider style={{ marginTop: "30px" }}>
        {" "}
        <h2>Add Book</h2>
      </Divider>{" "}
      <TextField
        label="Title"
        id="outlined-size-small"
        size="small"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <TextField
        label="Author name"
        id="outlined-size-small"
        size="small"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <TextField
        label="Publisher"
        id="outlined-size-small"
        size="small"
        value={publisher}
        onChange={(e) => setPublisher(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <TextField
        label="Copies"
        id="outlined-size-small"
        size="small"
        value={addcopies}
        onChange={(e) => setAddcopies(e.target.value)}
        style={{ marginRight: "10px" }}
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={handleAddBook}
        className="action-button"
        disabled={!metaMaskConnected} 
      >
        Add book
      </Button>
      <Divider style={{ marginTop: "30px" }}>
        <h2>Only Book Owner Functionality</h2>
      </Divider>{" "}
      <div style={{ marginTop: "30px" }}>
        <TextField
          label="Book Id"
          id="outlined-size-small"
          size="small"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          style={{ marginRight: "10px", width: "80px" }}
        />
        <TextField
          label="Copies"
          id="outlined-size-small"
          size="small"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          style={{ marginRight: "10px", width: "80px" }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleReduceCopies}
          className="action-button"
          disabled={!metaMaskConnected} 
        >
          Reduce Copy
        </Button>
      </div>
      <div style={{ marginTop: "30px" }}>
        <TextField
          label="Book Id"
          id="outlined-size-small"
          size="small"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          style={{ marginRight: "10px", width: "170px" }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleRemoveBook}
          className="action-button"
          disabled={!metaMaskConnected} 
        >
          Remove book
        </Button>
      </div>
      <Divider style={{ marginTop: "30px" }}>
        <h2>Your Borrowed Books</h2>
      </Divider>{" "}
      <div className="borrowed-books">
        {borrowedBooks.length > 0 && metaMaskConnected ? (
          <ul>
            {borrowedBooks.map((bookTitle, index) => (
              <p key={index}>{bookTitle}</p>
            ))}
          </ul>
        ) : (
          <p>No borrowed books</p>
        )}
      </div>
      <div className="section">
        {" "}
        <Divider style={{ marginTop: "30px" }}>
          {" "}
          <h2>Available Books</h2>
        </Divider>{" "}
        <Grid container spacing={3} className="card-container">
          {availableBooks.map((book, index) => (
            <Grid item xs={12} key={index}>
              <Card className="card">
                <CardContent className="card-content">
                  <div className="book-info">
                    <div className="image-section">
                      <img src={book1} alt="Book" className="book-photo" />
                    </div>
                    <div className="details-section">
                      <div className="book-details">
                        <Typography variant="body2" color="text.secondary">
                          Book ID: {book.bookID.toString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Title: {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Author: {book.author}
                        </Typography>
                        <div className="rating">
                          {/* Render stars for rating */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="extra-details">
                    <div className="left-column">
                      <Typography variant="body2" color="text.secondary">
                        Publisher: {book.publisher}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Copies: {book.copies.toString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Available Copies: {book.availableCopies.toString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Last Issue Date:{" "}
                        {book.lastIssueDate > 0
                          ? new Date(book.lastIssueDate * 1000).toLocaleString()
                          : "0"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Due Date:{" "}
                        {book.lastIssueDate > 0
                          ? new Date(book.dueDate * 1000).toLocaleString()
                          : "0"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Borrower: {book.borrower}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Owner: {book.owner}
                      </Typography>{" "}
                      <Typography variant="body2" color="text.secondary">
                        Average Rating: {book.avgRating.toString()}
                      </Typography>{" "}
                    </div>
                    <div className="right-column">
                      <div className="actions">
                        <div className="action">
                          {" "}
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleBorrow(book.bookID)}
                            className="action-button"
                            disabled={!metaMaskConnected} 
                          >
                            Borrow Book
                          </Button>
                        </div>
                        <div className="action">
                          {" "}
                          {/* <TextField
                            label="Copies"
                            id="outlined-size-small"
                            defaultValue="0"
                            size="small"
                            style={{ marginRight: "10px", width: "70px" }}
                          /> */}
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleReturn(book.bookID)}
                            className="action-button"
                            disabled={!metaMaskConnected} 
                          >
                            Return Book
                          </Button>
                        </div>
                        <div className="action">
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => handleRenew(book.bookID)}
                            className="action-button"
                            disabled={!metaMaskConnected} 
                          >
                            Renew Book
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>{" "}
                  <Divider>Give Rating</Divider>{" "}
                  <Rating
                    name="simple-controlled"
                    value={value}
                    onChange={(event, newValue) =>
                      handleRatingChange(book.bookID, newValue)
                    }
                    style={{ margin: "20px auto" }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
}

export default Library;
