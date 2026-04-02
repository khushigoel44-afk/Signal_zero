const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "Unknown Device" },
    type: { type: String, default: "tracker" },
    lastSeen: { type: Date, default: Date.now },
    currentRouteId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", default: null },
    status: {
      type: String,
      enum: ["MOVING", "STOPPED", "DELAYED"],
      default: "STOPPED"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Device", deviceSchema);
