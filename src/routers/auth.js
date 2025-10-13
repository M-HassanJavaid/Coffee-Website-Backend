const express = require('express');
require('dotenv').config();
const validator = require('validator');
const { User } = require('../models/user.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const { getVerficationTemp } = require('../utility_Function/verificationHtmlTemp.js');
const { Cart } = require('../models/cart.js')

//middlewares

const { checkAuth } = require('../middleware/checkAuth.js');

const authRouter = express.Router();


authRouter.post('/signup', async (req, res) => {
    try {
        let { name, email, password, role, secretKey } = req.body;

        if (role === 'admin' && !(process.env.ADMIN_KEY === secretKey)) {
            return res.status(403).json({
                ok: false,
                message: 'You cannot signup as an admin!'
            })
        }

        if (!name || !password || !(validator.isEmail(email))) {
            return res.status(400).json({
                ok: false,
                message: 'Invalid signup details!'
            })
        }

        if (!(validator.isStrongPassword(password))) {
            return res.json({
                ok: false,
                message: 'Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, one number, and one special symbol.'
            })
        }

        let isEmailRegister = await User.findOne({ email });


        if (isEmailRegister) {
            return res.status(409).json({
                ok: false,
                message: 'Email is already register!'
            })
        }

        let hashedPassword = await bcrypt.hash(password, 10);


        let newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: role || 'user',
            isVerified: false
        });

        const savedUser = await newUser.save();

        const token = jwt.sign({
            userId: savedUser._id,
            role: savedUser.role,
            isVerified: savedUser.isVerified,
            name: savedUser.name,
            email: savedUser.email
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            // httpOnly: true, 
            // secure: true, 
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let emailVerificationToken = jwt.sign({
            userId: savedUser._id
        }, process.env.JWT_SECRET, { expiresIn: '1h' })

        await transporter.sendMail({
            from: `"Coffee Club" <${process.env.EMAIL_USER}>`,
            to: savedUser.email,
            subject: "Verify your account",
            html: getVerficationTemp(`http://localhost:8080/auth/verifyEmail?token=${emailVerificationToken}`)
        });

        res.status(200).json({
            ok: true,
            message: 'User have successfully signup. Email verification link has send to your email, now verify your email.',
            user: savedUser
        });

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

authRouter.get('/verifyEmail', async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) throw new Error('Token is missing!');
        let decode = jwt.verify(token, process.env.JWT_SECRET);
        let { userId } = decode;
        let user = await User.findById(userId);
        if (!user) throw new Error('User not found!')
        if (user.isVerified) {
            return res.send('<h1>Your email is already verified.</h1> <p>Please wait we are redirecting...</p> <script> window.location.href = "https://www.google.com/?verified=true" </script>')
        }

        let userCart = new Cart({
            user: userId,
            items: [],
            totalAmount: 0
        })

        let createdCart = await userCart.save();
        user.isVerified = true;
        user.cart = createdCart._id;
        await user.save();

        res.redirect('https://www.google.com/?verified=true');
    } catch (error) {
        console.log(error.message)
        res.send(error.message)
    }
});

authRouter.get('/refreshToken' , async (req, res) => {

    try {

        let { token } = req.cookies;

        if (!token) throw new Error('Token not found.')

        const decode = await jwt.verify(token , process.env.JWT_SECRET)
        
        let userId = decode.userId;

        if (!userId) throw new Error('User id not found!');

        let user = await User.findById(userId);

        if (!user) throw new Error('User not found!')

        let verifiedToken = jwt.sign({
            userId: user._id,
            role: user.role,
            isVerified: user.isVerified,
            cart: user.cart,
            name: user.name,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', verifiedToken, {
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            ok: true,
            message: 'Token has refresh!'
        })

    } catch (error) {

        res.status(500).json({
            ok: false,
            message: error.message
        })

    }
});

authRouter.post('/login', async (req, res) => {
    try {

        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).send({
                ok: false,
                message: 'One or more login field is missing.'
            })
        }

        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'User not found!'
            })
        }

        let isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(402).json({
                ok: false,
                message: 'Invalid credentials!'
            })
        }

        let token = jwt.sign({
            userId: user._id,
            role: user.role,
            isVerified: user.isVerified,
            cart: user.cart,
            name: user.name,
            email: user.email
        }, process.env.JWT_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            ok: true,
            message: 'User has successfully login.',
            user: user
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        })
    }
});

authRouter.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({
        ok: true,
        message: 'user has successfully logout.'
    })
});

authRouter.put('/changePassword', checkAuth, async (req, res) => {
    try {
        let { userId } = req.user
        let { oldPassword, newPassword } = req.body;

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

        let isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

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

        let newHashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = newHashedPassword;

        await user.save();

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
});




module.exports = {
    authRouter
}