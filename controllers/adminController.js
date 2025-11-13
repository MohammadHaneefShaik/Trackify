const User = require("../models/User");
const Bus = require("../models/Bus");
const Stop = require("../models/Stop");

// Admin Dashboard
exports.adminDashboard = (req, res) => {
  res.render("layout", {
    message: "Admin Dashboard",
    page: "admin/adminIndex",
    title: 'Admin Page',
    user: req.user
  });
};

// ========================
// BUS MANAGEMENT
// ========================
exports.listBuses = async (req, res) => {
  const buses = await Bus.find().populate("driver");
  res.render("layout", {
    page: "admin/buses",
    title: 'List Buses',
    user: req.user,
    buses
  });
};

exports.createBusPage = async (req, res) => {
  const drivers = await User.find({ role: "DRIVER" });
  res.render("layout", {
    page: "admin/createBus",
    title: 'Create Bus',
    user: req.user,
    drivers
  });
};

exports.addBus = async (req, res) => {
  await Bus.create(req.body);
  res.redirect("/admin/buses");
};

// ========================
// DRIVER MANAGEMENT
// ========================
exports.listDrivers = async (req, res) => {
  const drivers = await User.find({ role: "DRIVER" });
  res.render("layout", {
    page: "admin/drivers",
    title: 'Drivers',
    user: req.user,
    drivers
  });
};

exports.createDriverPage = async (req, res) => {
  const buses = await Bus.find();
  res.render("layout", {
    page: "admin/createDriver",
    title: 'Create Driver',
    user: req.user,
    buses
  });
};

exports.createDriver = async (req, res) => {
  await User.create({ ...req.body, role: "DRIVER" });
  res.redirect("/admin/drivers");
};

// ========================
// STOP MANAGEMENT
// ========================
// controllers/adminController.js (or wherever you keep it)
exports.listStops = async (req, res) => {
  try {
    // Fetch all buses with their stops populated
    const buses = await Bus.find().populate({
      path: "stops",
      options: { sort: { order: 1 } },
    });

    res.render("layout", {
      page: "admin/stops",
      title: "Bus-wise Stops",
      user: req.user,
      buses,
    });
  } catch (err) {
    console.error("❌ Error loading stops:", err);
    res.status(500).send("Error loading stops");
  }
};

exports.createStopPage = async (req, res) => {
  const buses = await Bus.find(); // ✅ get all buses to choose from
  res.render("layout", {
    page: "admin/createStop",
    title: 'Create Stop',
    user: req.user,
    buses
  });
};

exports.addStop = async (req, res) => {
  try {
    const { busId, stopName, latitude, longitude, order } = req.body;

    // 1️⃣ Create the stop
    const stop = await Stop.create({
      busId,
      stopName,
      latitude,
      longitude,
      order,
    });

    // 2️⃣ Push stop reference into the Bus model
    await Bus.findByIdAndUpdate(busId, { $push: { stops: stop._id } });

    console.log(`✅ Stop "${stop.stopName}" added to Bus ${busId}`);
    res.redirect("/admin/stops");
  } catch (error) {
    console.error("❌ Error adding stop:", error);
    res.status(500).send("Server Error");
  }
};

// ========================
// LIVE TRACKING PAGE
// ========================
exports.liveTracking = (req, res) => {
  res.render("layout", {
    page: "admin/liveTracking",
    title: 'Bus Live Tracking',
    user: req.user
  });
};
