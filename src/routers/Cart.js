const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { Cart } = require('../models/cart.js');
const { checkAuth } = require('../middleware/checkAuth.js');
const { validateOptions } = require('../utility_Function/ValidateOptions.js');
const { Product } = require('../models/product.js');
const { compareOptions } = require('../utility_Function/compareOptions.js');
const { validateAndUpdateCartItems } = require('../utility_Function/updateCartItem.js');


const cartRouter = express.Router();

cartRouter.post('/add', checkAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { product: productId, quantity, note, selectedOptions } = req.body;
        let product = await Product.findById(productId);

        if (!product) {
            return res.status(400).json({
                ok: false,
                message: 'Inavlid Product ID.'
            })
        }

        if (!product.isAvailaible) {
            return res.status(400).json({
                ok: false,
                message: 'Product is not available.'
            })
        }

        let price = product.discountedPrice;

        let { valid, message, totalExtraPrice } = await validateOptions(selectedOptions, productId);

        if (!valid) {
            return res.status(400).json({
                ok: false,
                message: message
            })
        }


        let userCart = await Cart.findOne({ user: new ObjectId(userId) });

        if (!userCart) {
            let newUserCart = new Cart({
                user: userId,
                items: [],
                totalAmount: 0
            });

            userCart = await newUserCart.save()
        }

        let cartItems = userCart.items;

        let found = false;

        for (const item of cartItems) {

            if (item.product.toString() === productId && compareOptions(item.selectedOptions, selectedOptions)) {
                found = true;


                item.quantity = Number(item.quantity) + Number(quantity ?? 1);

                let totalPrice = (Number(totalExtraPrice) + Number(price)) * (Number(item.quantity));

                item.price.total = Number(totalPrice);
                item.price.totalExtraPrice = Number(totalExtraPrice);
                item.note = note ?? '';

                break;
            }

        }

        if (!found) {
            cartItems.push({
                product: productId,
                quantity,
                note,
                selectedOptions,
                price: {
                    totalExtraPrice: totalExtraPrice,
                    basePrice: product.price,
                    discountedPrice: product.discountedPrice,
                    discount: product.discount,
                    total: (Number(product.discountedPrice) + Number(totalExtraPrice)) * Number(quantity)
                }
            });

        }




        let cartTotalAmount = 0;

        for (const product of cartItems) {
            cartTotalAmount += product.price.total
        }

        userCart.totalAmount = cartTotalAmount;

        await userCart.save();

        if (found) {
            return res.json({
                ok: true,
                message: 'This product were already in cart, so we increased the quantity.'
            })
        }

        res.json({
            ok: true,
            message: 'New product has added to cart.'
        })



    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});


cartRouter.get('/me' , checkAuth , async (req , res)=>{

    try {
        
        let userId = req.user.userId;

        let userCart = await Cart.findOne({user: new ObjectId(userId)})
        .populate({
            path: 'items.product',
            select: '-price -discount -discountedPrice'
        });

        if (!userCart) {
            let newCart = new Cart({
                user: userId,
                items: [],
                totalAmount: 0
            })

            userCart = await newCart.save();
        }

        // userCart = userCart.toObject();


        // valid
        const { totalPrice , items , valid , status , message} = await validateAndUpdateCartItems(userCart.items)
        if (!valid) {
            return res.status(status).json({
                ok: false,
                message: message
            })
        } 

        userCart.items = items;
        userCart.totalAmount = totalPrice

        res.status(200).json({
            ok: true,
            message: 'Your cart has sent to you!',
            cart: userCart
        })


    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }

})

module.exports = {
    cartRouter
}