const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const { connectToDb } = require('./config/database.js');
const cookieParser = require('cookie-parser')

// Middleware
app.use(express.json());
app.use(cookieParser())

// Routes
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Start server
connectToDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error)=>{
        console.log(error.message)
    })