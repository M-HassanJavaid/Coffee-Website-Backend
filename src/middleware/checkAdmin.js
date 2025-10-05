function checkAdmin(req , res , next) {
    if (req.user.role === 'admin') {
        return next()
    }

    res.status(400).json({
        ok: false,
        message: "You are not an admin."
    })
}

module.exports = {
    checkAdmin
}