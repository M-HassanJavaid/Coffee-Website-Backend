const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const { connectToDb } = require('./config/database.js');
const cookieParser = require('cookie-parser');

// Routers
const { authRouter } = require('./routers/auth.js')
const { productRouter } = require('./routers/product.js')
const { userRouter } = require('./routers/user.js')
const { orderRouter } = require('./routers/order.js')

// Middleware
app.use(express.json());
app.use(cookieParser());

//Router API
app.use('/auth' , authRouter);
app.use('/product' , productRouter);
app.use('/user' , userRouter)
app.use('/order' , orderRouter)

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