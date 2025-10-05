const express = require('express');
const { checkAuth } = require('../middleware/checkAuth.js');
const { Order } = require('../models/order.js');
const { nanoid } = require('nanoid')
const { validateOptions } = require('../utility_Function/ValidateOptions.js')
const { calculatePrice } = require('../utility_Function/CalculatePrice.js')


const orderRouter = express.Router();

orderRouter.post('/create' , checkAuth , async (req , res)=>{
    try {
        const { userId } = req.user
        if (!userId) {
            return res.status(401).json({
                ok: false,
                message: 'User id not found!'
            })
        }

        const { items , address , note , paymentMethod } = req.body;

        if (!items || !address || !paymentMethod) {
            return res.status(409).json({
                ok: false,
                message: 'Invalid Order!'
            })
        }


        //Validating Options

        let isValid = [];
        
        for (const i of items) {
            let validation = await validateOptions(i.selectedOptions , i.product)
            isValid.push(validation)
        }

        for (const valid of isValid) {
            if (!valid.valid) {
                return res.status(400).json({
                    ok: false,
                    message: valid.message
                })
            }
        }



        //Calculating Price


        let itemsWithTotalPrice = await calculatePrice(items , isValid)

        let totalPrice = 0;

        for (const i of itemsWithTotalPrice) {
            totalPrice += Number(i.priceAtOrder.total);
        }

        let newOrder = new Order({
            user: userId,
            note,
            address,
            items: itemsWithTotalPrice,
            orderStatus: (paymentMethod === "cash_on_delivery") ? 'confirmed' : 'pending',
            paymentStatus: 'pending',
            paymentMethod,
            totalPrice,
            orderId: `ORD-${nanoid(8)}`
        })

        let savedOrder = await newOrder.save();

        res.status(200).json({
            ok: true,
            message: "Order has created successfully",
            orderId: savedOrder.orderId
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