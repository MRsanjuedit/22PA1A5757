# AffordMed URL Shortener Backend & Logging Service

This project is a production-grade backend microservice for URL shortening, accompanied by a robust logging service. The system is designed for reliability, observability, and ease of integration into larger systems.

## Project Structure

- `backend/` — The main URL shortener microservice (Node.js/Express, in-memory, no database)
- `logging-service/` — A dedicated logging microservice (Node.js/Express, file-based logs)
- `frontend/` — (Excluded from this repo)

## Features

### URL Shortener Backend
- Create globally unique short URLs with optional custom codes and expiry.
- All data is stored in memory (no database), so data is lost on server restart.
- Robust error handling and input validation.
- All API and redirect requests are logged via the logging microservice.
- No authentication required for API access.

### Logging Service
- Accepts logs only for backend stack and allowed backend/shared packages.
- Strict input validation for stack, level, and package fields.
- Logs are written to `logs/app.log` with automatic rotation (5MB per file).
- No logs are exposed via API for security.
- No authentication required.

## How to Run

### Prerequisites
- Node.js (v18 or above recommended)
- npm (comes with Node.js)

### 1. Install Dependencies
From the project root, run:

```
cd backend
npm install
cd ../logging-service
npm install
```

### 2. Start the Logging Service
```
cd logging-service
npm start
```
The logging service will run on [http://localhost:6000](http://localhost:6000) by default.

### 3. Start the Backend Service
```
cd ../backend
npm start
```
The backend will run on [http://localhost:5000](http://localhost:5000) by default.

## API Usage

### Create a Short URL
- **POST** `/shorturls`
- **Body:**
  ```json
  {
    "url": "https://example.com/very/long/url",
    "validity": 30, // optional, in minutes
    "shortcode": "custom1" // optional
  }
  ```
- **Response:**
  - `shortLink`: The generated short URL
  - `expiry`: Expiry timestamp (ISO format)

### Redirect to Original URL
- **GET** `/:shortcode`
- Redirects to the original URL if valid and not expired.

### Get Short URL Statistics
- **GET** `/shorturls/:shortcode`
- Returns stats including click count, creation/expiry, and click details.

### Logging Service API
- **POST** `/evalution-service/logs`
- **Body:**
  ```json
  {
    "stack": "backend",
    "level": "error",
    "package": "handler",
    "message": "received string, expected bool"
  }
  ```
- **Response:**
  - `logID`: Unique log identifier
  - `message`: Confirmation message

## Notes
- All logs are written to the `logs/` directory in the project root.
- The backend and logging service are decoupled and can be run independently.
- The frontend is excluded from this repository and is not required for backend or logging service operation.

## Troubleshooting
- If you see a white page in the frontend, check the browser console and ensure all dependencies are installed.
- If logs are not being written, ensure the `logs/` directory is writable and the logging service is running.
