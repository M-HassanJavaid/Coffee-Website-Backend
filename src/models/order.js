const mongoose = require('mongoose');
const validator = require('validator')

const addressSchema = new mongoose.Schema({
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: (value) => validator.isMobilePhone(value, 'any'),
      message: 'Phone number is not valid!'
    }
  },
  street: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    required: true 
  },
  postalCode: { 
    type: String, 
    required: true 
  },
  country: { 
    type: String, 
    required: true
  },
  landmark: { 
    type: String, 
    default: "Not Given" 
  }
} , {_id: false});

const selectedOptionsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    value: {
        type: String,
    }
} , {_id: false})

const priceSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },

  discountedPrice:{
    type: Number,
    required: true,
    min: 0
  },

  totalExtraPrice:{
    type : Number,
    required: true,
    min: 0
  },

  total:{
    type: Number,
    required: true,
    min: 0
  },

  discount:{
    type: Number,
    required: true,
    min: 0,
    max: 99,
  }

} , {_id: false})

const productSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    price:{
        type: priceSchema,
        required: true,
    },
    quantity:{
        type: Number,
        default: 1,
        min : 1
    },
    note:{
        type: String,
        minLength: 0, 
        maxLength: 300,
    },
    selectedOptions:{
        type: [selectedOptionsSchema]
    },
} , {_id: false});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    items: {
        type: [productSchema],
        required: true,
        validate: {
          validator: (value)=> value.length > 0,
          message: "Items cannot be empty!"
        }
    },

    totalAmount: {
      type: Number,
      required: true, // total after discount + quantity
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card", "wallet" ],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending",
    },

    address: {
      type: addressSchema,
      required: true
    },

    note: {
      type: String,
      maxLength: 300,
      default: "Not provided!"
    },

    orderId:{
      unique: true,
      required: true,
      index: true,
      type: String
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = { Order };
