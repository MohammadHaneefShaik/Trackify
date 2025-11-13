
const User = require("../models/User");

exports.driverDashboard = async (req, res) => {
  const driver = await User.findById(req.user._id);
  res.render("driverHome", { busId: driver.assignedBus });
};

exports.startTrip = async (req, res) => {
  const driver = await User.findById(req.user._id);

  await Trip.create({
    busId: driver.assignedBus,
    driverId: driver._id
  });

  res.send("Trip Started");
};

exports.endTrip = async (req, res) => {
  const driver = await User.findById(req.user._id);

  await Trip.findOneAndUpdate(
    { busId: driver.assignedBus, driverId: driver._id, isActive: true },
    { isActive: false, endTime: Date.now() }
  );

  res.send("Trip Ended");
};
