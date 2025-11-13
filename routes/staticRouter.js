const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth");
const Bus = require('../models/Bus');

router.get("/", protect, async (req, res) => {
  try {
    if (!req.user) return res.redirect("/auth/login");

    // Fetch buses with stops populated
    const buses = await Bus.find().populate({
      path: "stops",
      options: { sort: { order: 1 } }
    });

    // Flatten stops to make them usable on frontend
    const stops = buses.flatMap(bus =>
      bus.stops.map(stop => ({
        ...stop.toObject(),
        busId: bus._id.toString(),
      }))
    );

    res.render("layout", {
      title: "Home",
      page: "index",
      user: req.user,
      buses,
      stops,
    });
  } catch (err) {
    console.error("❌ Error loading home page:", err);
    res.status(500).send("Error loading page");
  }
});


module.exports = router;
