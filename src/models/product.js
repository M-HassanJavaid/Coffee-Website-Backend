const mongoose = require('mongoose');
const validator = require('validator');

const optionsValueSchema = new mongoose.Schema({
    label:{
        type: String,
        required: true,
    },
    extraPrice:{
        type: Number,
        required: true,
        min: 0
    }
})

const optionsSchema = new mongoose.Schema({
    isRequired: {
        type: Boolean,
        required: true,
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    values:{
        type: [optionsValueSchema],
        required: true,
    }
})

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 5,
        maxLength: 100,
        required: true,
        trim: true
    },

    description: {
        type: String,
        minLength: 10,
        maxLength: 500,
        trim: true,
        required: true
    },

    price: {
        type: Number,
        required: true,
        min: 1
    },

    discount: {
        type: Number,
        required: true,
        min: 0,
        max: 99,
        default: 0
    },

    image: {
        type: String,
        required: true,
        validate: {
            validator: (value) => validator.isURL(value) && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value),
            message: 'This is not a valid image URL.'
        }
    },

    category: {
        type: String,
        required: true,
        enum: [
            'hotCoffee',
            'frappes',
            'iceCoffee',
            'tea',
            'others',
            'snacks',
            'cooler',
            'matcha'
        ]
    },

    impressions:{
        type: Number,
        default: 0,
        min: 0
    },

    sales: {
        type: Number,
        default: 0,
        min: 0
    },

    isAvailaible: {
        type: Boolean,
        default: true
    },

    adddedInCart: {
        type: Number,
        default: 0,
    },

    popularityScore: {
        type: Number,
        default: 0
    },

    options:{
        type: [optionsSchema],
        default: []
    }

}, { timestamps: true }

)

const Product = mongoose.model('Product', productSchema, 'products');

module.exports = {
    Product
}

