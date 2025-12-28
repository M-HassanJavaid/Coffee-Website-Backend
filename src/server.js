const express = require('express');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const { connectToDb } = require('./config/database.js');
const cookieParser = require('cookie-parser');
const cors = require('cors')

// Routers
const { authRouter } = require('./routers/auth.js')
const { productRouter } = require('./routers/product.js')
const { userRouter } = require('./routers/user.js')
const { orderRouter } = require('./routers/order.js')
const { cartRouter } = require('./routers/Cart.js');
const { AnalyticsRouter } = require('./routers/analytics.js')

// Middleware

app.use(cors({
    origin: [
    'http://127.0.0.1:5500' , 
    'http://localhost:5173',
    'http://localhost:5174',],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

//Router API
app.use('/auth' , authRouter);
app.use('/product' , productRouter);
app.use('/user' , userRouter);
app.use('/order' , orderRouter);
app.use('/cart' , cartRouter);
app.use('/analytics' , AnalyticsRouter );

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
    });
