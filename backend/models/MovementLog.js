const mongoose = require("mongoose");

const movementLogSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route" },
    timestamp: { type: Date, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number, required: true, default: 0 },
    matchedSegment: { type: Number, default: 0 },
    eta: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MovementLog", movementLogSchema);
