// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

contract Ownable {
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "Contract not invoked by the owner.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
}

contract Library is Ownable {
    //enumeration to capture the various states of the book
    enum BookState {
        Available,
        Borrowed,
        Renewed,
        Lost,
        Removed
    }

    struct Book {
        string title;
        uint256 copies;
        uint256 bookID;
        string author;
        string publisher;
        address owner;
        uint256 lastIssueDate;
        uint256 dueDate;
        uint256 avgRating;
        address borrower;
        uint256 availableCopies;
        BookState bookState;
    }

    struct Rating {
        uint256 one;
        uint256 two;
        uint256 three;
        uint256 four;
        uint256 five;
    }

    //State Variables
    uint256 public totalNumBooks;
    mapping(uint256 => Book) public bookCatalog;
    mapping(address => bool) public isMember;
    mapping(uint256 => Rating) private rating;
    mapping(address => uint256[]) public borrowedBooks;

    // Events
    event NewBookAdded(uint256 id, string title, uint256 copies);
    event NewCopiesAdded(uint256 id, uint256 copies);
    event BookBorrowed(uint256 indexed id, address borrower);
    event BookReturned(uint256 id, address borrower);

    function addBook(
        string memory title,
        string memory author,
        string memory publisher,
        uint256 _copies
    ) public {
        require(_copies > 0, "Add at least one copy of the book.");

        ++totalNumBooks;

        bookCatalog[totalNumBooks] = Book({
            bookID: totalNumBooks,
            title: title,
            author: author,
            publisher: publisher,
            bookState: BookState.Available,
            owner: msg.sender,
            lastIssueDate: 0,
            dueDate: 0,
            avgRating: 0,
            borrower: msg.sender,
            copies: _copies,
            availableCopies: _copies
        });

        emit NewBookAdded(
            bookCatalog[totalNumBooks].bookID,
            title,
            bookCatalog[totalNumBooks].copies
        );
    }

    function reduceCopies(uint256 id, uint256 copies) public returns (bool) {
        //check if we have this id of book
        require(id <= totalNumBooks, "not valid id");
        require(
            bookCatalog[id].owner == msg.sender,
            "Only Book owner can reduce copies of the book..!"
        );
        require(bookCatalog[id].copies >= copies, "invalid copies..!");

        bookCatalog[id].copies = bookCatalog[id].copies - copies;
        bookCatalog[id].availableCopies =
            bookCatalog[id].availableCopies -
            copies;

        return true;
    }

    function removeBook(uint256 id) public returns (bool) {
        //check if we have this id of book
        require(id <= totalNumBooks, "not valid id");
        require(
            bookCatalog[id].owner == msg.sender,
            "Only Book owner can remove the book..!"
        );

        delete bookCatalog[id];
        bookCatalog[id].bookState = BookState.Removed;
        totalNumBooks--;
        return true;
    }

    function borrowBook(uint256 _id, uint256 _copies) public {
        require(
            bookCatalog[_id].owner != msg.sender,
            "book owner can't borrow book"
        );
        require(_id <= totalNumBooks, "invalid Id");
        require(
            (bookCatalog[_id].availableCopies >= _copies),
            "Not enough copies for now"
        );

        bookCatalog[_id].bookState = BookState.Borrowed;
        bookCatalog[_id].borrower = msg.sender;
        bookCatalog[_id].availableCopies =
            bookCatalog[_id].availableCopies -
            _copies;
        bookCatalog[_id].lastIssueDate = block.timestamp;
        bookCatalog[_id].dueDate = bookCatalog[_id].lastIssueDate + 5 minutes; //5 minutes for testing purpose, can be set 30 days from date of lastIssueDate

        // Store the borrowed book ID for the user
        borrowedBooks[msg.sender].push(_id);
    }

    //Return Book
    // Return Book
    function returnBook(uint256 _id, uint256 _copies) public returns (string[] memory){
        require(
            bookCatalog[_id].borrower == msg.sender,
            "You don't own this book"
        );

        bookCatalog[_id].availableCopies += _copies;
        bookCatalog[_id].bookState = BookState.Available;

        string[] memory remainingbook = getBorrowedBookTitles();

        for (uint256 i = 0; i < remainingbook.length; i++) {
            if (
                keccak256(abi.encodePacked(bookCatalog[_id].title)) ==
                keccak256(abi.encodePacked(remainingbook[i]))
            ) {
                bookCatalog[_id].borrower = bookCatalog[_id].borrower;
            } else {
                bookCatalog[_id].borrower = bookCatalog[_id].owner;
            }
        }

        bookCatalog[_id].dueDate = 0;

        // Remove the returned book ID from the user's borrowedBooks array
        uint256[] storage borrowedBookIds = borrowedBooks[msg.sender];
        for (uint256 i = 0; i < borrowedBookIds.length; i++) {
            if (borrowedBookIds[i] == _id) {
                // Swap with the last element and pop
                borrowedBookIds[i] = borrowedBookIds[
                    borrowedBookIds.length - 1
                ];
                borrowedBookIds.pop();
                break; // Exit the loop once the ID is found and removed
            }
        }

        return remainingbook;
    }

    function renewBook(uint256 _id) public returns (bool) {
        require(_id <= totalNumBooks && _id > 0, "invalid Id");
        require(
            bookCatalog[_id].borrower == msg.sender,
            "you don't own this book"
        );

        bookCatalog[_id].bookState = BookState.Renewed;
        bookCatalog[_id].lastIssueDate = block.timestamp;
        bookCatalog[_id].dueDate = bookCatalog[_id].lastIssueDate + 5 minutes; //5 minutes for testing purpose can be set 30 days from date of lastIssueDate

        return true;
    }

    function getAvailableBooks() public view returns (Book[] memory) {
        uint256 availableCount = 0;

        // Count the number of available books
        for (uint256 i = 1; i <= totalNumBooks; i++) {
            availableCount++;
        }

        // Initialize an array to store available books
        Book[] memory availableBooks = new Book[](availableCount);
        uint256 index = 0;

        // Populate the array with available books
        for (uint256 i = 1; i <= totalNumBooks; i++) {
            if (bookCatalog[i].availableCopies > 0) {
                availableBooks[index] = bookCatalog[i];
                index++;
            }
        }

        return availableBooks;
    }

    function getBorrowedBookTitles() public view returns (string[] memory) {
        uint256[] memory borrowedBookIds = borrowedBooks[msg.sender];
        string[] memory borrowedBookTitles = new string[](
            borrowedBookIds.length
        );

        for (uint256 i = 0; i < borrowedBookIds.length; i++) {
            uint256 bookId = borrowedBookIds[i];
            borrowedBookTitles[i] = bookCatalog[bookId].title;
        }

        return borrowedBookTitles;
    }

    function addReview(uint256 _id, uint256 _rating) public returns (uint256) {
        require(_id <= totalNumBooks && _id > 0, "Invalid Book ID");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");

        if (_rating == 1) {
            ++rating[_id].one;
        }
        if (_rating == 2) {
            ++rating[_id].two;
        }
        if (_rating == 3) {
            ++rating[_id].three;
        }
        if (_rating == 4) {
            ++rating[_id].four;
        }
        if (_rating == 5) {
            ++rating[_id].five;
        }

        uint256 totalnumberratings = rating[_id].one +
            rating[_id].two +
            rating[_id].three +
            rating[_id].four +
            rating[_id].five;

        uint256 weightedtotal = (1 * rating[_id].one) +
            (2 * rating[_id].two) +
            (3 * rating[_id].three) +
            (4 * rating[_id].four) +
            (5 * rating[_id].five);

        bookCatalog[_id].avgRating = weightedtotal / totalnumberratings;

        return (bookCatalog[_id].avgRating);
    }
}
