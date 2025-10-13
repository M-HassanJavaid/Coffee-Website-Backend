const express = require('express');
const { Product } = require('../models/product.js');
const { upload } = require('../middleware/upload.js');
const { checkAdmin } = require('../middleware/checkAdmin.js');
const { checkAuth } = require('../middleware/checkAuth.js');
const { calculatePopularityScore } = require('../utility_Function/calcPopularitoryScore.js');
const { cloudinary } = require('../config/cloudinary.js');

let productRouter = express.Router();

productRouter.post('/add', checkAuth, checkAdmin, upload.single('image'), async (req, res) => {
    try {
        console.log(req.body)
        let { name, description, price, discount, category, options } = req.body;
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                ok: false,
                message: "Invalid product details"
            })
        }
        discount = discount ?? 0;

        price = Number(price)
        if (isNaN(price) || price < 0) {
            return res.status(400).json({
                ok: false,
                message: 'product price is invalid'
            })
        }

        discount = Number(discount)
        if (isNaN(discount) || discount < 0 || discount > 99) {
            return res.status(400).json({
                ok: false,
                message: 'Discount is not valid.'
            })
        }

        let discountedPrice = Math.round(price - (price * discount / 100));

        let newProduct = new Product({
            name,
            description,
            discount,
            price,
            discountedPrice,
            image: {
                url: req.file.path,
                id: req.file.filename
            },
            options: options ? JSON.parse(options) : [],
            category
        });

        let savedProduct = await newProduct.save();

        res.status(200).json({
            ok: true,
            message: "Product has succeddfully added.",
            productDetails: savedProduct
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        });

        await cloudinary.uploader.destroy(result.req.file.filename);

    }
});

productRouter.get('/all', async (req, res) => {
    try {
        let filter = {}
        let { category, query, maxPrice, minPrice, availaible } = req.query;
        if (category) filter.category = category;
        if (query) {
            filter.$or = [
                {
                    name: {
                        $regex: query,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: query,
                        $options: 'i'
                    }
                }
            ]
        }
        if (maxPrice) filter.discountedPrice = { $lte: maxPrice }
        if (minPrice) filter.discountedPrice = { $gte: minPrice }
        if (availaible) filter.isAvailaible = true

        let sortQuery = {}
        if (req.query.sort === 'price_ascending') sortQuery.discountedPrice = 1;
        if (req.query.sort === 'price_decending') sortQuery.discountedPrice = -1;
        if (req.query.sort === 'discount') sortQuery.discountedPrice = -1

        const products = await Product.find(filter).sort(sortQuery);

        res.status(200).json({
            ok: true,
            total: products.length,
            message: 'Products detailed has sent succefully',
            products: products,
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

productRouter.get('/id/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                ok: false,
                message: 'Product not found.'
            })
        }

        res.status(200).json({
            ok: true,
            message: 'Product has send!',
            product: product
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }
});

productRouter.put('/edit/:id', checkAuth, checkAdmin, upload.single('image'), async (req, res) => {
    try {
        let id = req.params.id;
        let updates = req.body;
        console.log(updates);

        let allowUpdates = ['name', 'description', 'price', 'discount', 'category', 'isAvailaible', 'options'];

        if (!updates) {
            return res.status(404).json({
                ok: false,
                message: 'No Update found.',
            })
        }

        let isUpdateAble = Object.keys(updates).every(u => allowUpdates.includes(u));

        if (!isUpdateAble) {
            return res.status(400).json({
                ok: false,
                message: 'Updation is not valid!'
            })
        }

        if (req.file) {
            updates.image = {
                url: req.file.path,
                id: req.file.filename
            }
        }

        let updatedProduct = await Product.findByIdAndUpdate(id, updates, {
            returnDocument: 'after',
            new: true,
            runValidators: true
        });

        if (!updatedProduct) {
            return res.status(404).json({
                ok: false,
                message: 'Product not found.'
            })
        }

        res.status(200).json({
            ok: true,
            message: 'Product has updated succeffully'
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        });

    }
});

productRouter.delete('/delete/:id', checkAuth, checkAdmin, async (req, res) => {
    try {
        let id = req.params.id;

        let deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                ok: false,
                message: "Product not found."
            })
        }

        res.json({
            ok: true,
            message: 'Product has deleted!',
            product: deletedProduct
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

productRouter.put('/click/:productId', async (req , res) => {
    try {
        let productId = req.params.productId;

        let product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                ok: false,
                message: 'Product not found!'
            })
        }

        product.impressions = product.impressions + 1;
        let newPopularitoryScore = calculatePopularityScore(product);
        product.popularityScore = newPopularitoryScore;
        await product.save();

        res.status(200).json({
            ok: true,
            message: 'Product click has recorded!'
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }
});

productRouter.get('/popular/:quantity' , async (req , res)=>{
    try {
        let quantity = req.params.quantity;
        let products = await Product.find().sort({popularityScore : -1}).limit(quantity)

        if (!products) {
            return res.status(404).json({
                ok: false,
                message: 'Products not found!'
            })
        }

        res.status(200).json({
            ok: true,
            message: `Top ${quantity} popular products has sent to you!`,
            products
        })

    } catch (error) {
        
        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
})

module.exports = {
    productRouter
}