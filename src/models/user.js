const mongoose = require("mongoose");
const validator = require("validator");

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
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (value) => validator.isStrongPassword(value),
        message: "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special symbol.",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      required: true,
    },

    cart: {
      type: mongoose.Schema.Types.ObjectId,
    },

    address: {
      type: addressSchema,

    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = { User };
