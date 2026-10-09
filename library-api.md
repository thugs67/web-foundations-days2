// List All Books

Method: GET

Path: /api/v1/books

Description: Retrieves a paginated list of all books in the library catalog.

Success Status Code: 200 OK

// List Books by Author
Method: GET

Path: /api/v1/books?author=Orwell

Description: Filters and returns books authored by the specified name or query string.

Success Status Code: 200 OK

// Get a Specific Book
Method: GET

Path: /api/v1/books/:id

Description: Retrieves detailed information for a single book by its unique ID.

Success Status Code: 200 OK

Method: POST

Path: /api/v1/books

Description: Adds a new book entry to the library catalog.

Success Status Code: 201 Created

Method: PUT

Path: /api/v1/books/:id

Description: Replaces all attributes of an existing book with updated data.

// Error Handling 

400 Bad Request
Occurs when the client submits invalid input data or omits required payload fields.

Example Scenario: A client sends a POST /api/v1/books request without the mandatory "title" field or passes an invalid "publishedYear" value (e.g., "publishedYear": "invalid_year").

404 Not Found
Occurs when the client requests a resource that does not exist on the server.

Example Scenario: A client sends a GET /api/v1/books/9999 request, but no book with ID 9999 exists in the database.