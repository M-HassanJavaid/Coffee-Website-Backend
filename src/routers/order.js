const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { checkAuth } = require('../middleware/checkAuth.js');
const { Order } = require('../models/order.js');
const { nanoid } = require('nanoid')
const { checkAdmin } = require('../middleware/checkAdmin.js');
const { Cart } = require('../models/cart.js');
const { validateAndUpdateCartItems } = require('../utility_Function/updateCartItem.js');
const { calculatePopularityScore } = require('../utility_Function/calcPopularitoryScore.js');
const { Product } = require('../models/product.js');


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

//function to update product popularitory score
async function updatePopularitoryScore(items) {
    try {
        for (const item of items) {
            let productId = item.product.toString();
            let product = await Product.findById(productId);
            let quantity = item.quantity;
            product.addedInCart = product.addedInCart - quantity;
            product.sales = product.sales + quantity;
            let popularityScore = calculatePopularityScore(product);
            product.popularityScore = popularityScore;
            await product.save()
        }

    } catch (error) {
        console.log(error.message)
    }
}

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

        
        res.json({
            ok: true,
            message: 'Order has placed successfully.',
            orderId: createdOrder.orderId
        })
        
        userCart.items = [];
        userCart.totalAmount = 0;

        await userCart.save()
        
        updatePopularitoryScore(items)

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

        let userOrders = await Order.find({ user: new ObjectId(userId) });

        res.status(200).json({
            ok: true,
            message: 'Your previous orders has sent!',
            orders: userOrders
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

async function popularitoryScoreForCancelOrder(items) {
    try {
        for (const item of items) {
            let productId = item.product.toString();
            let product = await Product.findById(productId);
            product.sales = product.sales - 1;
            let newPopularitoryScore = calculatePopularityScore(product);
            product.popularityScore = newPopularitoryScore;
            await product.save()
        }
    } catch (error) {
        console.log(error.message)
    }
}

orderRouter.put('/cancel/:orderId', checkAuth, async (req, res) => {
    try {
        let userId = req.user.userId;
        let orderId = req.params.orderId;

        let order = await Order.findOne({ orderId: orderId, user: new ObjectId(userId) });

        if (!order) {
            return res.status(404).json({
                ok: false,
                message: 'No order found by this user!'
            })
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.status(200).json({
            ok: true,
            message: 'Order has successfully cancelled!'
        })

        popularitoryScoreForCancelOrder(order.items)

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

orderRouter.get('/me/:orderId', checkAuth, async (req, res) => {
    try {
        let userId = req.user.userId;
        let orderId = req.params.orderId;

        let order = await Order.findOne({ user: userId, orderId: orderId });

        if (!order) {
            return res.status(404).json({
                ok: false,
                message: "Order not found!"
            })
        }

        res.status(200).json({
            ok: true,
            message: 'Order has sent to you!',
            order
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
})

orderRouter.put('/update/:orderId', checkAuth, checkAdmin, async (req, res) => {
    try {
        let orderId = req.params.orderId;
        let order = await Order.findOne({ orderId });

        let { orderStatus, paymentStatus } = req.body;

        if (!orderStatus && !paymentStatus) {
            return res.status(400).json({
                ok: false,
                message: 'You did not provide any update!'
            })
        }

        let validOrderStatuses = ["pending", "confirmed", "delivered", "cancelled"];
        let validPaymentStatuses = ["pending", "paid", "failed"];

        if (orderStatus) {

            if (!(validOrderStatuses.includes(orderStatus))) {
                return res.status(400).json({
                    ok: false,
                    message: "Order status is not valid."
                })
            }

            order.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            
            if (!(validPaymentStatuses.includes(paymentStatus))) {
                return res.status(400).json({
                    ok: false,
                    message: 'payment status is not valid.'
                })
            }

            order.paymentStatus = paymentStatus;

        }

        await order.save()

        res.status(200).json({
            ok: true,
            message: "order has successfully updated!"
        })

    } catch (error) {

        res.status(500).json({
            ok: true,
            message: error.message
        })

    }
})

module.exports = {
    orderRouter
}