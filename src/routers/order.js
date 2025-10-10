const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { checkAuth } = require('../middleware/checkAuth.js');
const { Order } = require('../models/order.js');
const { nanoid } = require('nanoid')
const { validateOptions } = require('../utility_Function/ValidateOptions.js')
const { calculatePrice } = require('../utility_Function/CalculatePrice.js')
const { checkAdmin } = require('../middleware/checkAdmin.js');
const { Cart } = require('../models/cart.js');
const { validateAndUpdateCartItems } = require('../utility_Function/updateCartItem.js');


const orderRouter = express.Router();

orderRouter.get('/all', checkAuth, checkAdmin, async (req, res) => {
    try {

        let orders = await Order.find()
            .populate([
                {
                    path: "user",
                    select: '-password'
                },
                {
                    path: "items.product"
                }
            ]);

        res.status(200).json({
            ok: false,
            message: "Order details has sent!",
            orders: orders
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

orderRouter.get('/id/:id', checkAuth, checkAdmin, async (req, res) => {

    try {
        let id = req.params.id;

        let order = await Order.findOne({ orderId: id })
            .populate([
                {
                    path: "user",
                    select: '-password'
                },
                {
                    path: "items.product"
                }
            ]);

        if (!order) {
            return res.status(400).json({
                ok: false,
                message: 'Inavlid Order ID'
            })
        }

        res.json({
            ok: true,
            message: "Order Details has send!",
            order: order
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })
    }

})

// collect order from cart 

orderRouter.post('/checkout', checkAuth, async (req, res) => {
    try {
        const userId = req.user.userId;

        const { paymentMethod, address, note } = req.body;

        if (!address || !paymentMethod) {
            return res.send({
                ok: false,
                message: 'You did not give payment method or address.'
            })
        }

        let userCart = await Cart.findOne({ user: new ObjectId(userId) });

        if (!userCart || (userCart.items.length === 0)) {
            return res.status(404).json({
                ok: false,
                message: "Your cart is empty!"
            })
        }

        console.log(userCart.items)
        const { totalPrice, items, valid, status, message } = await validateAndUpdateCartItems(userCart.items)

        if (!valid) {
            return res.status(status).json({
                ok: false,
                message: message
            })
        }


        let newOrder = new Order({
            user: userId,
            totalAmount: totalPrice,
            paymentMethod,
            orderStatus: paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending',
            address,
            note,
            orderId: `ORD-${nanoid(8)}`,
            items
        });

        let createdOrder = await newOrder.save();

        userCart.items = [];
        userCart.totalAmount = 0;

        await userCart.save()

        res.json({
            ok: true,
            message: 'Order has placed successfully.',
            orderId: createdOrder.orderId
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }
})

orderRouter.get('/me', checkAuth, async (req, res) => {
    try {
        let userId = req.user.userId;

        let userOrders = await Order.find({user: new ObjectId(userId)});

        res.status(200).json({
            ok: true,
            message: 'Your previous order has sent!',
            orders: userOrders
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
})

module.exports = {
    orderRouter
}