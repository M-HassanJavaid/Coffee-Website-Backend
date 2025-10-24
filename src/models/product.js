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
}, {_id: false})

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
        validate:{
            validator: (value) => {
                if (value.length === 0) {
                    return false
                }
                return true
            },

            message: 'An option should have minimum 1 value.'
        }
    }
} , {_id : false})

const imageSchema = new mongoose.Schema({
    url:{
        type: String,
        validate: {
            validator: (value) => validator.isURL(value) && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value),
            message: 'This is not a valid image URL.'
        },
        required: true
    }, 
    id:{
        type: String,
        required: true
    }
}, {_id: false})

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
        type: imageSchema,
        required: true
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

    addedInCart: {
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
    },

    discountedPrice:{
        type: Number,
        min: 1,
        required: true
    }

}, { timestamps: true }

)

const Product = mongoose.model('Product', productSchema, 'products');

module.exports = {
    Product
}

