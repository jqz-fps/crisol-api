# Crisol API (Unofficial)

This is an unnofficial API for the Crisol online shop. It is a simple Node.js application that uses the [Crisol](https://www.crisol.com.pe/) website to scrape some data.

## Features

- Search for products by keyword
- Get product details by ISBN
- Get physical stores information

## Installation

1. Clone the repository
2. Install dependencies using `npm install`
3. Create a `.env` file in the root directory and add the following variables:

```
PORT = 3000 // Port to run the application on, default is 3000

MINUTES_LIMIT = 1 // Number of minutes to limit requests to the API, default is 15
MAX_REQUESTS = 3 // Maximum number of requests allowed within the time limit, default is 100
```

4. Run the application using or `npm run prod`

## Installation with Docker

If you have Docker installed, you can pull the image from this [Docker Hub Repository](https://hub.docker.com/r/jqzfps/crisol-api) and run it.

## Disclaimer

This project is **not affiliated, endorsed, or maintained** by **Librerías Crisol S.A.C.** or any of its subsidiaries.  
All data provided by this API is **publicly available** on [crisol.com.pe](https://www.crisol.com.pe/).