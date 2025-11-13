const express = require("express");
const { protect, restrictTo } = require("../middlewares/auth");
const router = express.Router();
const Bus = require("../models/Bus");

router.get("/dashboard", protect, restrictTo("DRIVER"), async (req, res) => {
  try {
    // Find the bus assigned to this driver
    const assignedBus = await Bus.findOne({ driver: req.user._id }).populate({
      path: "stops",
      options: { sort: { order: 1 } },
    });

    res.render("layout", {
      message: "Driver Dashboard",
      page: "driver",
      title: "Driver Page",
      user: req.user,
      assignedBus: assignedBus ? assignedBus._id : null,
      stops: assignedBus?.stops || [], 
    });
  } catch (err) {
    console.error("❌ Error loading driver dashboard:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
