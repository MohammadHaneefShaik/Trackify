const express = require("express");
const { protect } = require("../middlewares/auth");
const router = express.Router();

router.get("/user/dashboard", protect, (req, res) => {
  res.json({ message: "User Dashboard", user: req.user });
});

module.exports = router;
