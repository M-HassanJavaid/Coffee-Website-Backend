const express = require('express');
const { checkAuth } = require('../middleware/checkAuth.js');
const { User } = require('../models/user.js');
const bcrypt = require('bcrypt');
const validator = require('validator')

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

userRouter.put('/changePassword' , checkAuth , async (req , res) =>{
    try {
        let { userId } = req.user
        let { oldPassword  , newPassword} = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                ok: false,
                message: "User's old and new password is required!"
            })
        }
        
        
        let user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({
                ok: false,
                message: 'User not found!'
            })
        }
        
        let isPasswordMatch = await bcrypt.compare(oldPassword , user.password);
        
        if (!isPasswordMatch) {
            return res.status(400).json({
                ok: false,
                message: 'Password did not match!'
            })
        }
        
        if (!validator.isStrongPassword(newPassword)) {
            return res.send(422).json({
                ok: false,
                message: 'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special symbol.'
            })
        }

        let newHashedPassword = await bcrypt.hash(newPassword , 10);

        user.password = newHashedPassword;

        user.save();

        res.json({
            ok: true,
            message: 'Password has successfully changed!'
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }
})

module.exports = {
    userRouter
}