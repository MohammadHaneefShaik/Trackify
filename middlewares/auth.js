// middlewares/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

exports.protect = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) return res.redirect("/auth/login");

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    const currentUser = await User.findById(decoded._id).select("-password");
    if (!currentUser) return res.redirect("/auth/login");

    // ✅ Correct: assign user, not null
    req.user = currentUser;
    res.locals.user = currentUser;

    return next();
  } catch (err) {
    console.log("Protect error:", err);
    return res.redirect("/auth/login");
  }
};


// restrictTo middleware
exports.restrictTo = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).send("Not authenticated");

    if (!roles.includes(req.user.role))
      return res.status(403).send("Access denied");

    next();
  };
};

