const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/auth");

const {
  adminDashboard,
  listBuses, createBusPage, addBus,
  listDrivers, createDriverPage, createDriver,
  listStops, createStopPage, addStop,
  liveTracking
} = require("../controllers/adminController");

router.get("/", protect, restrictTo('ADMIN'), adminDashboard);
router.get("/dashboard", protect, restrictTo('ADMIN'), adminDashboard);

// Bus CRUD
router.get("/buses", protect, restrictTo('ADMIN'), listBuses);
router.get("/buses/create", protect, restrictTo('ADMIN'), createBusPage);
router.post("/buses/create", protect, restrictTo('ADMIN'), addBus);

// Driver CRUD
router.get("/drivers", protect, restrictTo('ADMIN'), listDrivers);
router.get("/drivers/create", protect, restrictTo('ADMIN'), createDriverPage);
router.post("/drivers/create", protect, restrictTo('ADMIN'), createDriver);

// Stops CRUD
router.get("/stops", protect, restrictTo('ADMIN'), listStops);
router.get("/stops/create", protect, restrictTo('ADMIN'), createStopPage);
router.post("/stops/create", protect, restrictTo('ADMIN'), addStop);

// Live Track
router.get("/live-tracking", protect, restrictTo('ADMIN'), liveTracking);

module.exports = router;
