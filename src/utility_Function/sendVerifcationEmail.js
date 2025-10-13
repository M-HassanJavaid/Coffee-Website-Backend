const { getVerficationTemp } = require('./verificationHtmlTemp.js')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

async function sendVerificationEmail(userId , userEmail) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let emailVerificationToken = jwt.sign({
            userId: userId
        }, process.env.JWT_SECRET, { expiresIn: '1h' })

        await transporter.sendMail({
            from: `"Coffee Club" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Verify your account",
            html: getVerficationTemp(`http://localhost:8080/auth/verifyEmail?token=${emailVerificationToken}`)
        });

        return true
    } catch (error) {
        console.error(error.message)
        return false
    }
}

module.exports = {
    sendVerificationEmail
}