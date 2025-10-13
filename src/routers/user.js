const express = require('express');
const { checkAuth } = require('../middleware/checkAuth.js');
const { User } = require('../models/user.js');
const bcrypt = require('bcrypt');

const userRouter = express.Router();

userRouter.get('/profile', checkAuth, async (req, res) => {
    try {
        const { userId } = req.user;
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                ok: false,
                message: "User not found!"
            })
        }

        user = user.toObject(); // <-- convert from Mongoose doc to plain object
        delete user.password;

        res.status(200).json({
            ok: true,
            message: 'User profile has send!',
            profile: user
        })
    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

module.exports = {
    userRouter
}