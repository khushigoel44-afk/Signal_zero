const express = require("express");
const {
  getRoutes,
  getRouteById,
  createRoute,
  getWaypointsByRouteId
} = require("../controllers/routeController");

const router = express.Router();

router.get("/", getRoutes);
router.get("/:id", getRouteById);
router.post("/", createRoute);
router.get("/:id/waypoints", getWaypointsByRouteId);

module.exports = router;
