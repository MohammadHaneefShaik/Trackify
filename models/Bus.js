const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: true,
    unique: true,
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  stops: [{ type: mongoose.Schema.Types.ObjectId, ref: "stops" }]
});

module.exports = mongoose.model("Bus", busSchema);
