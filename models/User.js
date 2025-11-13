const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["USER", "ADMIN", "DRIVER"], default: "USER" },

  driverDetails: {
    phone: { type: String, default: undefined },
    assignedBus: { type: mongoose.Schema.Types.ObjectId, ref: "Bus", default: undefined }
  },
  stopName: {
    type: String
  },
  busNumber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  }

}, { timestamps: true });

// ✅ Hide driverDetails for non-DRIVER roles
userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  if (obj.role !== "DRIVER") {
    delete obj.driverDetails;
  }
  return obj;
};

// ✅ Remove driverDetails entirely before saving (avoid null fields in DB)
userSchema.pre("save", function (next) {
  if (this.role !== "DRIVER") {
    this.driverDetails = undefined;
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
