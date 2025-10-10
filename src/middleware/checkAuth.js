const jwt = require('jsonwebtoken');
require('dotenv').config();

async function checkAuth(req, res, next) {
  try {
    const { token } = req.cookies;
    if (!token) throw new Error("No token found");

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!(decode.isVerified)) {
      return res.status(401).json({
        ok: true,
        message: 'You are not verified!'
      })
    }

    req.user = decode; // ✅ now you can access req.user in protected routes

    next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    res.status(401).json({
      ok: false,
      message: 'User is not logged in!'
    });
  }
}

module.exports = { checkAuth };
