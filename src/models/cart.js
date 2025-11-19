const mongoose = require('mongoose');

const selectedOptionsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  value: {
    type: String,
  }
}, { _id: false })

const priceSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },

  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },

  totalExtraPrice: {
    type: Number,
    required: true,
    min: 0
  },

  total: {
    type: Number,
    required: true,
    min: 0
  },

  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 99,
  }

}, { _id: false })

const productSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  price: {
    type: priceSchema,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  note: {
    type: String,
    minLength: 0,
    maxLength: 300,
  },
  selectedOptions: {
    type: [selectedOptionsSchema]
  },
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  items: {
    type: [productSchema],
    required: true,
  },

  totalAmount: {
    required: true,
    min: 0,
    type: Number
  }
})

const Cart = mongoose.model('Cart', cartSchema, 'userCarts')


module.exports = {
  Cart
}