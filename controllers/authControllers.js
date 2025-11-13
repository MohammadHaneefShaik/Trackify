// controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const Bus = require('../models/Bus');

// -------------------- TOKEN HELPER --------------------
function createSendToken(user, res, redirectPath) {
  const token = jwt.sign(
    { _id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  user.password = undefined;
  return res.redirect(redirectPath);
}

// -------------------- SIGNUP --------------------

exports.handleUserSignUp = async (req, res) => {
  try {
    const { name, email, password, role, assignedBus } = req.body;

    // 🛑 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send("User with this email already exists.");
    }

    // ✅ If role is DRIVER, verify that bus isn't already assigned
    if (role === "DRIVER" && assignedBus) {
      const bus = await Bus.findById(assignedBus);

      if (!bus) {
        return res.status(400).send("Selected bus not found.");
      }

      if (bus.driver) {
        return res.status(400).send("This bus already has a driver assigned!");
      }
    }

    // Create new user
    const newUser = await User.create({ name, email, password, role });

    // If it's a driver, link the bus
    if (role === "DRIVER" && assignedBus) {
      await Bus.findByIdAndUpdate(assignedBus, { driver: newUser._id });
    }

    res.redirect("/auth/login");
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).send("Error signing up");
  }
};

// -------------------- LOGIN --------------------
exports.handleUserLogin = async (req, res) => {
  console.log("Request body:", req.body);

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Direct password check (as you chose plain text)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    if (user.role === "DRIVER") {
      return createSendToken(user, res, "/driver/dashboard");
    }

    if (user.role === "ADMIN") {
      return createSendToken(user, res, "/admin/dashboard");
    }

    console.log("✅ Login Success");

    // ✅ Use createSendToken so the cookie gets set!
    return createSendToken(user, res, "/");

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// -------------------- LOGOUT --------------------
exports.handleLogout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now() - 1000)
  });

  return res.redirect("/auth/login");
};
