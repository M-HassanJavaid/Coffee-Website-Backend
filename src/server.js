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
const { cartRouter } = require('./routers/Cart.js')
const { Cart } = require("./models/cart.js")

// Middleware
app.use(express.json());
app.use(cookieParser());

//Router API
app.use('/auth' , authRouter);
app.use('/product' , productRouter);
app.use('/user' , userRouter)
app.use('/order' , orderRouter)
app.use('/cart' , cartRouter)

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


// (async (params) => {
//     let cart = await Cart.findById('68e774fec256b5893e909fe5');
//     console.log(cart);
//     let cartItems = cart.items;
//     console.log(cartItems);
//     for (const item of cartItems) {
//         console.log('Signle item => ' + item)
//     }
// })()
