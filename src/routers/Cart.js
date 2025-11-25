const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { Cart } = require('../models/cart.js');
const { checkAuth } = require('../middleware/checkAuth.js');
const { validateOptions } = require('../utility_Function/ValidateOptions.js');
const { Product } = require('../models/product.js');
const { compareOptions } = require('../utility_Function/compareOptions.js');
const { validateAndUpdateCartItems } = require('../utility_Function/updateCartItem.js');
const { calculatePopularityScore } = require('../utility_Function/calcPopularitoryScore.js');


const cartRouter = express.Router();

//Update product popularitory score while addToCart

async function popularityScoreForAddToCart(product, qtyToAdd) {
    try {
        product.addedInCart = product.addedInCart + qtyToAdd;
        let newPopularitoryScore = calculatePopularityScore(product)
        product.popularityScore = newPopularitoryScore;
        await product.save();
        console.log(product)
    } catch (error) {
        console.log(error.message)
    }
}

cartRouter.post('/add', checkAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { product: productId, quantity, note, selectedOptions } = req.body;

        let itemId;

        //this is for updating poularitory score and addedInCart for product
        let quantityAddedInCart = 0;

        if (!productId || !quantity) {
            return res.status(400).json({
                ok: false,
                message: "Inavlid addition in cart"
            })
        }

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
                message: `${product.name} is not available.`
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

                item.quantity = Number(item.quantity) + Number(quantity);
                let totalPrice = (Number(totalExtraPrice) + Number(price)) * (Number(item.quantity));
                item.price.total = Number(totalPrice);
                item.price.totalExtraPrice = Number(totalExtraPrice) * Number(item.quantity);
                item.note = note ?? '';

                quantityAddedInCart = quantity;
                itemId = item._id.toString()

                break;
            }

        }


        if (!found) {
            itemId = new mongoose.Types.ObjectId();

            cartItems.push({
                _id: itemId,
                product: productId,
                quantity,
                note,
                selectedOptions,
                price: {
                    totalExtraPrice: Number(totalExtraPrice) * Number(quantity),
                    basePrice: product.price,
                    discountedPrice: product.discountedPrice,
                    discount: product.discount,
                    total: (Number(product.discountedPrice) + Number(totalExtraPrice)) * Number(quantity)
                }
            });

            quantityAddedInCart = quantity;

        }




        let cartTotalAmount = 0;

        for (const product of cartItems) {
            cartTotalAmount += product.price.total
        }

        userCart.totalAmount = cartTotalAmount;


        let updatedCart = await userCart.save()
        updatedCart = await updatedCart.populate({
            path: 'items.product',
            select: '-price -discount -discountedPrice'
        });;

        setImmediate(() => popularityScoreForAddToCart(product, quantityAddedInCart))

        if (found) {
            return res.json({
                ok: true,
                message: 'This product were already in cart, so we increased the quantity.',
                cartItemId: itemId,
                cart: updatedCart
            })
        }


        res.json({
            ok: true,
            message: 'New product has added to cart.',
            id: itemId,
            cert: updatedCart
        })




    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});


cartRouter.get('/me', checkAuth, async (req, res) => {

    try {

        console.log('Fetching cart for user:', req.user);

        let userId = req.user.userId;

        let userCart = await Cart.findOne({ user: new ObjectId(userId) })
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

        // valid
        const { totalPrice, items, valid, status, message } = await validateAndUpdateCartItems(userCart.items)

        console.log('is valid:', valid);

        if (!valid) {
            return res.status(status).json({
                ok: false,
                message: message
            })
        }

        console.log('Cart items =>', items);

        userCart.items = items;
        userCart.totalAmount = totalPrice


        res.status(200).json({
            ok: true,
            message: 'Your cart has sent to you!',
            cart: userCart
        })

        await userCart.save()

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }

})

// updation function for product popularitory score while removing product from cart

async function updatePopularitoryScore(productId, qtyRemoveFromCart) {
    try {
        let product = await Product.findById(productId);
        if (!product) throw new Error('Product not found!');
        product.addedInCart = product.addedInCart - qtyRemoveFromCart;
        let newPopularitoryScore = calculatePopularityScore(product);
        product.popularityScore = newPopularitoryScore;
        await product.save();
    } catch (error) {
        console.log(error.message)
    }
}

cartRouter.delete('/remove/:cartItemId', checkAuth, async (req, res) => {
    try {
        let cartItemId = req.params.cartItemId;
        let userId = req.user.userId;
        let userCart = await Cart.findOne({ user: new ObjectId(userId) })
        if (!userCart) {
            return res.status(404).json({
                ok: false,
                message: "user don't have cart!"
            })
        }
        // let items = userCart.items;

        userCart.items = userCart.items.filter((item) => {
            if (item._id.toString() === cartItemId) {
                let productId = item.product;
                setImmediate(() => {
                    updatePopularitoryScore(productId, item.quantity)
                })

                return false
            }

            return true
        });

        let updatedCart = await userCart.save()
        updatedCart = await updatedCart.populate({
            path: 'items.product',
            select: '-price -discount -discountedPrice'
        });

        const { totalPrice, items, valid, status, message } = await validateAndUpdateCartItems(updatedCart.items)


        if (!valid) {
            return res.status(status).json({
                ok: false,
                message: message
            })
        }


        updatedCart.items = items;
        updatedCart.totalAmount = totalPrice;

        res.status(200).json({
            ok: true,
            message: 'Cart item has successfully removed from cart!',
            cart: updatedCart
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

// function to update product popularitory score on updating product quntity in cart
async function updatePopularitoryScoreOnProductUpdate(productId, oldQuantity, newQuantity) {
    try {
        let product = await Product.findById(productId);

        product.addedInCart = product.addedInCart - oldQuantity;
        product.addedInCart = product.addedInCart + newQuantity;
        let newPopularitoryScore = calculatePopularityScore(product);
        product.popularityScore = newPopularitoryScore;

        await product.save()

    } catch (error) {

        console.log(error.message)

    }
}

cartRouter.put('/update/:cartItemId', checkAuth, async (req, res) => {
    try {
        let userId = req.user.userId;
        let cartItemId = req.params.cartItemId;
        let { note, quantity, selectedOptions } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({
                ok: false,
                message: 'quantity cannot be 0 or less then 0.'
            })
        }

        if (!note && !quantity && !selectedOptions) {
            return res.status(400).json({
                ok: false,
                message: "You did not provide any updates."
            })
        }

        let userCart = await Cart.findOne({ user: new ObjectId(userId) });

        if (!userCart) {
            return res.status(404).json({
                ok: false,
                message: 'Cart not found!',
            })
        }

        let isProductFound = false;
        let oldQuantity;
        let productId;


        for (const item of userCart.items) {
            if (item._id.toString() === cartItemId) {

                isProductFound = true;
                oldQuantity = item.quantity;
                productId = item.product.toString();

                if (note) item.note = note;
                if (quantity) item.quantity = quantity;
                if (selectedOptions) item.selectedOptions = selectedOptions

            }
        }

        if (!isProductFound) {
            return res.status(404).json({
                ok: false,
                message: 'This product not found'
            })
        }


        const { totalPrice, items, valid, status, message } = await validateAndUpdateCartItems(userCart.items);

        if (!valid) {
            return res.status(status).json({
                ok: false,
                message: message
            })
        }

        userCart.items = items
        userCart.totalAmount = totalPrice;

        let updatedCart = await userCart.save()
        updatedCart = await updatedCart.populate({
            path: 'items.product',
            select: '-price -discount -discountedPrice'
        });

        res.status(200).json({
            ok: true,
            message: 'Cart Item has successfully updated!',
            cart: updatedCart
        })

        if (quantity) updatePopularitoryScoreOnProductUpdate(productId, oldQuantity, quantity)

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

async function popularitoryScoreOnClearCart(items) {
    try {
        for (const item of items) {
            let productId = item.product;
            let quantityToRemove = item.quantity;
            let product = await Product.findById(productId);
            product.addedInCart = Number(product.addedInCart) - Number(quantityToRemove);
            await product.save();
        }
    } catch (error) {
        console.log(error.message)
    }
}

cartRouter.delete('/clear', checkAuth, async (req, res) => {
    try {
        let userId = req.user.userId;
        let userCart = await Cart.findOne({ user: new Object(userId) });

        if (!userCart) {
            return res.status(404).json({
                ok: false,
                message: 'Cart not found.'
            })
        }

        setImmediate(() => popularitoryScoreOnClearCart(userCart.items));
        userCart.items = [];
        userCart.totalAmount = 0;

        let updatedCart = await userCart.save();

        res.status(200).json({
            ok: true,
            message: 'Your cart has clear.',
            cart: updatedCart
        })

    } catch (error) {
        console.log(error.message)
    }
})

module.exports = {
    cartRouter
}