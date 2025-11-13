const Bus = require("../models/Bus");
const BusLocation = require("../models/BusLocation");

exports.userHome = async (req, res) => {
  const buses = await Bus.find({});
  res.render("userHome", { buses });
};

exports.viewBusLocation = async (req, res) => {
  const busId = req.params.busId;
  const busLocation = await BusLocation.findOne({ busId });

  res.render("userMap", {
    busId,
    latitude: busLocation?.latitude || 0,
    longitude: busLocation?.longitude || 0
  });
};
