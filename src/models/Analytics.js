const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({

    event: {
        type: String,
        enum: [
            'impression',
            'add_to_cart',
            'remove_from_cart',
            'order',
            'update_cart_item',
            'clear_cart',
            'cancel_order',
            'signup',
            'email_verified'
        ],
        required: true
    },


    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },

    
    productId: {
        type: mongoose.Types.ObjectId,
        ref: 'Product'
    },


    orderId: {
        type: mongoose.Types.ObjectId,
        ref: 'Order'
    },

    quantity: {
        type: Number,
        min: 1,
        default: null
    },

    selectedOptions: {
        type: Array,
        default: []
    },

    page: {
        type: String,
    },

    cartItemId: {
        type: mongoose.Types.ObjectId,
    },

    note: {
        type: String
    }



}, { timestamps: true });

const Anylatics = mongoose.model('AnalyticsEvent', analyticsSchema , 'analyticsEvents' );

module.exports = { Anylatics }
