const mongoose = require('mongoose');

const selectedOptionsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    value: {
        type: String,
        required: true,
    },

    extraPrice: {
        type: Number,
        min: 0,
        required: true
    }
})

const productSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    priceAtOrder:{
        type: Number,
        required: true,
        min: 1
    },
    quantity:{
        type: Number,
        default: 1,
        min : 1
    },
    note:{
        type: String,
        minLength: 3, 
        maxLength: 300,
    },
    selectedOptions:{
        type: []
    }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },

    items: {
        type: [productSchema],
        required: true
    },

    totalAmount: {
      type: Number,
      required: true, // total after discount + quantity
      min: 1,
    },

    discountApplied: {
      type: Number,
      default: 0, // total discount percentage or amount applied
      min: 0,
      max: 99
    },

    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card", "wallet"],
      default: "cash_on_delivery",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    address: {
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "Pakistan" },
      landMark: { type: String  , }
    },

    notes: {
      type: String,
      maxLength: 300,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = { Order };
