const mongoose = require("mongoose");

const waypointSchema = new mongoose.Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    name: { type: String, required: true }
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["train", "logistics", "trekking"],
      required: true
    },
    waypoints: { type: [waypointSchema], default: [] },
    totalDistance: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);
